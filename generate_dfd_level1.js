const plantumlEncoder = require('plantuml-encoder');
const fs = require('fs');
const https = require('https');

const uml = `
@startuml
!theme plain
skinparam defaultFontName Tahoma
skinparam {
    BackgroundColor white
    RectangleBackgroundColor white
    RectangleBorderColor black
    RectangleBorderThickness 1
    UsecaseBackgroundColor white
    UsecaseBorderColor black
    UsecaseBorderThickness 1
    DatabaseBackgroundColor white
    DatabaseBorderColor black
    DatabaseBorderThickness 1
}

' External Entities
rectangle "Player" as player
rectangle "Gemini API" as gemini

' Data Stores
database "D1: Users" as db_users
database "D2: Questions" as db_questions

' Processes
usecase "1.0\\nManage\\nAuthentication" as p1
usecase "2.0\\nManage Game\\nSetup" as p2
usecase "3.0\\nProcess\\nGameplay" as p3
usecase "4.0\\nManage\\nScores &\\nLeaderboard" as p4

' Authentication Flows
player --> p1 : Credentials
p1 --> db_users : Read/Write User Data
db_users --> p1 : User Validation
p1 --> player : Auth Status

' Setup Flows
player --> p2 : Select Category & Difficulty
p2 --> db_questions : Request Questions
db_questions --> p2 : Question Data
p2 --> p3 : Game Configuration

' Gameplay Flows
p3 --> player : Display Question (Image/Audio)
player --> p3 : Submit Answer
player --> p3 : Request Hint
p3 --> gemini : Context (Category, Question, Answer)
gemini --> p3 : Hint Text
p3 --> player : Result (Correct/Wrong, Hint)

' Scoring Flows
p3 --> p4 : Game Results / Score
p4 --> db_users : Update Total Score / Stats
player --> p4 : Request Leaderboard
db_users --> p4 : Top Scores Data
p4 --> player : Leaderboard View

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
  const path = 'dfd_level1.png';
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);
  writeStream.on('finish', () => {
    writeStream.close();
    console.log('Saved DFD Level 1 as dfd_level1.png');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
