# schemas.py
from typing import Optional, Annotated
from datetime import date
from pydantic import BaseModel, EmailStr, StringConstraints

RegNo  = Annotated[str, StringConstraints(min_length=6, max_length=15, pattern=r"^\d+$",        strip_whitespace=True)]
Name   = Annotated[str, StringConstraints(min_length=2, max_length=100, pattern=r"^[A-Za-z\s]+$", strip_whitespace=True)]
Course = Annotated[str, StringConstraints(min_length=2, max_length=200, strip_whitespace=True)]

class Student(BaseModel):
    regno: RegNo
    name:  Name
    email: EmailStr
    course: Course

class OD(BaseModel):
    event: str
    date: date                   # parsed automatically from "YYYY-MM-DD"
    proof_file_id: Optional[str]

class ODRequest(BaseModel):
    student: Student
    od: OD
