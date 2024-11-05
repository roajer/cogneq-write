from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    stripe_customer_id = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, default="free")  # free, lite, pro
    subscription_end_date = Column(DateTime, nullable=True)
    
    profile = relationship("UserProfile", back_populates="user", uselist=False)
    preferences = relationship("UserPreferences", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    full_name = Column(String)
    bio = Column(String)
    writing_experience = Column(String)
    genre_focus = Column(String)
    
    user = relationship("User", back_populates="profile")

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    theme = Column(String, default="light")
    writing_style = Column(String)
    ai_model_preference = Column(String)
    notification_settings = Column(JSON)
    
    user = relationship("User", back_populates="preferences")