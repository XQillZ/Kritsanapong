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
rectangle "Gemini API" as gemini

' System
usecase "0\\nWord Guessing\\nGame System" as system

' Data Flows
player --> system : Login / Register data\nCategory & Difficulty selection\nAnswers / Hint requests
system --> player : Game UI (Questions/Images)\nHints / Answer feedback\nScores / Leaderboard

system --> gemini : Question context
gemini --> system : Generated Hint

@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
  const path = 'dfd_level0.png';
  const writeStream = fs.createWriteStream(path);
  res.pipe(writeStream);
  writeStream.on('finish', () => {
    writeStream.close();
    console.log('Saved DFD Level 0 flows as dfd_level0.png');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
