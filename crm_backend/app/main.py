from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.api.routers import clients, login, products, audit
from app.db.database import init_db
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="CRM Service",
    description="Backend-сервис для CRM на FastAPI и PostgreSQL",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation Error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    
    print(f"Unhandled exception: {exc}") 
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error", "error_message": str(exc)},
    )



api_prefix = "/api/v1"
app.include_router(login.router, prefix=f"{api_prefix}/login", tags=["Login"])
app.include_router(clients.router, prefix=f"{api_prefix}/clients", tags=["Clients"])
app.include_router(products.router, prefix=f"{api_prefix}/products", tags=["Products"])
app.include_router(audit.router, prefix=f"{api_prefix}/audit", tags=["Audit"])

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "ok", "message": "Welcome to CRM Backend!"}