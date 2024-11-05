from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    firebase_uid: str

class User(UserBase):
    id: int
    firebase_uid: str

    class Config:
        from_attributes = True

class UserProfileBase(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    writing_experience: Optional[str] = None
    genre_focus: Optional[str] = None
    theme: Optional[str] = "light"
    writing_style: Optional[str] = None
    ai_model_preference: Optional[str] = "gpt-4"

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    subscription_status: str
    subscription_end_date: Optional[datetime] = None

class UserProfile(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserPreferencesBase(BaseModel):
    theme: Optional[str] = "light"
    writing_style: Optional[str] = None
    ai_model_preference: Optional[str] = "gpt-4"
    notification_settings: Optional[Dict] = None

class UserPreferencesCreate(UserPreferencesBase):
    pass

class UserPreferencesUpdate(UserPreferencesBase):
    pass

class UserPreferences(UserPreferencesBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True