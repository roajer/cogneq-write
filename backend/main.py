from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import models, schemas, crud
from database import SessionLocal, engine
from auth import get_current_user
import stripe
from datetime import datetime, timedelta
import json

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Initialize Stripe
stripe.api_key = "sk_test_x2J7SgLglodAv348mrzsPcbS"

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/user/profile", response_model=schemas.UserProfileResponse)
async def get_user_profile(
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        profile = crud.get_user_profile(db, current_user.id)
        preferences = crud.get_user_preferences(db, current_user.id)
        
        if not profile:
            profile = crud.create_user_profile(db, schemas.UserProfileCreate(), current_user.id)
        if not preferences:
            preferences = crud.create_user_preferences(db, schemas.UserPreferencesCreate(), current_user.id)
        
        return {
            "full_name": profile.full_name or "",
            "bio": profile.bio or "",
            "writing_experience": profile.writing_experience or "",
            "genre_focus": profile.genre_focus or "",
            "theme": preferences.theme or "light",
            "writing_style": preferences.writing_style or "",
            "ai_model_preference": preferences.ai_model_preference or "gpt-4",
            "subscription_status": "free",  # Default to free until subscription is implemented
            "subscription_end_date": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/user/profile")
async def update_user_profile(
    profile_data: schemas.UserProfileUpdate,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        crud.update_user_profile(db, profile_data, current_user.id)
        crud.update_user_preferences(db, profile_data, current_user.id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    current_user: schemas.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = await request.json()
    price_id = data.get("priceId")
    
    try:
        # Get or create Stripe customer
        user = crud.get_user_by_id(db, current_user.id)
        if not user.stripe_customer_id:
            customer = stripe.Customer.create(
                email=user.email,
                metadata={"firebase_uid": user.firebase_uid}
            )
            crud.update_stripe_customer_id(db, user.id, customer.id)
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=user.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url="http://localhost:5173/success",
            cancel_url="http://localhost:5173/cancel",
        )
        
        return {"sessionUrl": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))