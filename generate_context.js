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
}

' External Entities
rectangle "Player" as player
rectangle "Google Gemini API" as gemini
rectangle "Firebase (Auth/DB/Storage)" as firebase

' System
usecase "0\\nWord Guessing Game\\n(ระบบเกมทายคำศัพท์)" as system

' Data Flows from/to Player
player -right-> system : Login/Registration Info\\nCategory & Difficulty Choice\\nGame Answers\\nHint Requests
system -left-> player : Game Interface (Images/Audio)\\nFeedback (Correct/Wrong)\\nHints\\nScore & Leaderboard

' Data Flows from/to Gemini
system -up-> gemini : Question Context
gemini -down-> system : Generated Hint

' Data Flows from/to Firebase
system -down-> firebase : User Data & Scores\\nData Queries
firebase -up-> system : Authentication Result\\nQuestions Data\\nLeaderboard Data

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
  const path = 'context_diagram.png';
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);
  writeStream.on('finish', () => {
    writeStream.close();
    console.log('Saved Context Diagram as context_diagram.png');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
