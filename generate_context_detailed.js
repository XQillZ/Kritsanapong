const plantumlEncoder = require('plantuml-encoder');
const fs = require('fs');
const https = require('https');

const uml = `
@startuml
!theme plain
skinparam defaultFontName Tahoma
skinparam {
    BackgroundColor white
    RectangleBackgroundColor #90EE90
    RectangleBorderColor black
    RectangleBorderThickness 2
    RectangleFontSize 14
    RectangleFontStyle bold
    CircleBackgroundColor #87CEEB
    CircleBorderColor black
    CircleBorderThickness 3
}

' External Entities - positioned around the system
rectangle "Player\n(ผู้เล่น)" as player
rectangle "Google Gemini\n(ระบบ AI คำใบ้)" as gemini
rectangle "Firebase\n(ระบบฐานข้อมูล)" as firebase
rectangle "Firebase Auth\n(ระบบยืนยันตัวตน)" as auth

' Central System as Circle
circle "Word Guessing Game\\n(ระบบเกมทายคำศัพท์)" as system

' Data Flows to/from Player
player --> system : Registration/Login Data\nGame Settings\nAnswers & Hint Requests
system --> player : Game Interface\nFeedback & Hints\nScores & Leaderboard

' Data Flows to/from Gemini
system --> gemini : Question Context\n(Category, Question, Answer)
gemini --> system : Generated Hint\n(Thai Text 1-2 sentences)

' Data Flows to/from Firebase Database
system --> firebase : User Scores\nGame Statistics
firebase --> system : Questions (150 items)\nUser Profiles\nLeaderboard Data

' Data Flows to/from Firebase Auth
system --> auth : Login Credentials\nauth --> system : Auth Token\nUser ID

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
  const path = 'context_diagram_detailed.png';
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);
  writeStream.on('finish', () => {
    writeStream.close();
    console.log('Saved detailed Context Diagram as context_diagram_detailed.png');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
