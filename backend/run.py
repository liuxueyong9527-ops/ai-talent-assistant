from pathlib import Path

# Ensure data directory exists
Path("data").mkdir(exist_ok=True)
(Path("data") / "uploads").mkdir(exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
