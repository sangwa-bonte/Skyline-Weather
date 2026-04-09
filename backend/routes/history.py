from fastapi import APIRouter, HTTPException, Query
from services.weather_service import get_search_history, delete_history_entry, clear_all_history

router = APIRouter()


@router.get("")
async def list_history(limit: int = Query(default=20, ge=1, le=100)):
    history = await get_search_history(limit=limit)
    return {"history": history, "count": len(history)}


@router.delete("/{entry_id}")
async def delete_entry(entry_id: str):
    deleted = await delete_history_entry(entry_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="History entry not found")
    return {"message": "Entry deleted successfully"}


@router.delete("")
async def clear_history():
    count = await clear_all_history()
    return {"message": f"Cleared {count} history entries"}
