import os
import shutil
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.db.session import get_db
from app.api.deps import get_current_user
from app.models.employee import Employee
from app.models.document import Document
from app.schemas.document import DocumentResponse

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED, summary="Upload Document")
def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    entity_type: Optional[str] = Form("general"),
    entity_id: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Upload a file attachment and save metadata."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided.")

    safe_title = title.strip() if title else file.filename
    clean_filename = f"{int(os.urandom(4).hex(), 16)}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, clean_filename)

    # Save file on disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    document = Document(
        title=safe_title,
        file_name=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        entity_type=entity_type or "general",
        entity_id=entity_id,
        description=description,
        uploaded_by_id=current_user.id
    )

    db.add(document)
    db.commit()
    db.refresh(document)
    return document


@router.get("", response_model=List[DocumentResponse], summary="List Documents")
def get_documents(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
) -> Any:
    """List documents with optional filtering and pagination."""
    query = db.query(Document)

    if entity_type:
        query = query.filter(Document.entity_type == entity_type)

    if entity_id is not None:
        query = query.filter(Document.entity_id == entity_id)

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Document.title.ilike(search_fmt),
                Document.file_name.ilike(search_fmt),
                Document.description.ilike(search_fmt)
            )
        )

    return query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{document_id}/download", summary="Download Document File")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Download physical file by document ID."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Physical file missing on server.")

    return FileResponse(
        path=document.file_path,
        filename=document.file_name,
        media_type=document.mime_type or "application/octet-stream"
    )


@router.delete("/{document_id}", summary="Delete Document")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
) -> Any:
    """Delete document metadata and physical file."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found.")

    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except Exception:
            pass

    db.delete(document)
    db.commit()
    return {"message": f"Document #{document_id} deleted."}
