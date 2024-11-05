from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
import models, schemas

def get_user_by_firebase_uid(db: Session, firebase_uid: str):
    return db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(email=user.email, firebase_uid=user.firebase_uid)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def get_user_preferences(db: Session, user_id: int):
    return db.query(models.UserPreferences).filter(models.UserPreferences.user_id == user_id).first()

def create_user_preferences(db: Session, preferences: schemas.UserPreferencesCreate, user_id: int):
    db_preferences = models.UserPreferences(**preferences.model_dump(), user_id=user_id)
    try:
        db.add(db_preferences)
        db.commit()
        db.refresh(db_preferences)
        return db_preferences
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def update_user_preferences(db: Session, preferences: schemas.UserPreferencesUpdate, user_id: int):
    db_preferences = get_user_preferences(db, user_id)
    if not db_preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    for key, value in preferences.model_dump(exclude_unset=True).items():
        setattr(db_preferences, key, value)
    
    try:
        db.commit()
        db.refresh(db_preferences)
        return db_preferences
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

def get_user_profile(db: Session, user_id: int):
    return db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()

def update_user_profile(db: Session, profile: schemas.UserProfileUpdate, user_id: int):
    db_profile = get_user_profile(db, user_id)
    if not db_profile:
        db_profile = models.UserProfile(user_id=user_id)
        db.add(db_profile)
    
    for key, value in profile.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    try:
        db.commit()
        db.refresh(db_profile)
        return db_profile
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))