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

skinparam linetype ortho

' External Entities
rectangle "Player" as player
rectangle "Google Gemini API" as gemini

' Data Stores
database "D1: Users" as d1
database "D2: Questions" as d2

' Processes
usecase "1.0\\nUser Management" as p1
usecase "2.0\\nGame Setup" as p2
usecase "3.0\\nGameplay" as p3
usecase "4.0\\nAI Hint" as p4
usecase "5.0\\nScore Management" as p5

' Flows
player --> p1 : Auth Data
p1 --> player : Login Result
p1 --> d1 : New User Data
d1 --> p1 : Auth Check

player --> p2 : Category & Difficulty
p2 --> p3 : Game Settings

p3 --> d2 : Request Questions
d2 --> p3 : 10 Random Questions
p3 --> player : Question / Image / Audio
player --> p3 : Answer
p3 --> player : Result / Correct Answer

player --> p4 : Request Hint
p4 --> gemini : Context (Question+Answer)
gemini --> p4 : Hint Text
p4 --> player : Show Hint
p4 --> p3 : Deduct Score (if Hard)

p3 --> p5 : Game Result
p5 --> player : Score Summary
p5 --> d1 : Update Total Score

player --> p5 : Request Leaderboard
d1 --> p5 : All Players Scores
p5 --> player : Show Leaderboard

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
    const path = 'dfd_level1_final.png';
    const filePath = fs.createWriteStream(path);
    res.pipe(filePath);
    filePath.on('finish', () => {
        filePath.close();
        console.log('Image saved as ' + path);
    });
}).on('error', (err) => {
    console.error('Error: ', err.message);
});
