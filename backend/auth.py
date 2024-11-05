from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth, credentials, initialize_app
import firebase_admin
from sqlalchemy.orm import Session
from database import SessionLocal
import crud, schemas

# Initialize Firebase Admin SDK
cred = credentials.Certificate("firebase-service-account.json")
try:
    firebase_admin.get_app()
except ValueError:
    initialize_app(cred)

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(lambda: SessionLocal())
) -> schemas.User:
    try:
        token = credentials.credentials
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        
        user = crud.get_user_by_firebase_uid(db, firebase_uid)
        if not user:
            user = crud.create_user(db, schemas.UserCreate(
                email=decoded_token.get("email", ""),
                firebase_uid=firebase_uid
            ))
        
        return schemas.User(
            id=user.id,
            email=user.email,
            firebase_uid=user.firebase_uid
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )