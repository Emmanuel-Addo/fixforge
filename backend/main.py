from fastapi import FastAPI

app = FastAPI(title="FixForge API", version="0.1.0")


@app.get("/")
def root():
    return {"message": "FixForge backend is running."}
