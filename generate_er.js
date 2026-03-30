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
    HexagonBackgroundColor white
    HexagonBorderColor black
    HexagonBorderThickness 1
}

rectangle "Users" as users

usecase "uid (PK)" as u_uid
usecase "username" as u_name
usecase "email" as u_email
usecase "totalScore" as u_total
usecase "gamesPlayed" as u_games

users -up- u_uid
users -up- u_name
users -up- u_email
users -left- u_total
users -left- u_games

usecase "scores" as u_scores
usecase "animals" as s_anim
usecase "vehicles" as s_veh
usecase "musical_inst" as s_music

users -down- u_scores
u_scores -down- s_anim
u_scores -down- s_veh
u_scores -down- s_music

rectangle "Questions" as questions

usecase "id (PK)" as q_id
usecase "category" as q_cat
usecase "question" as q_text
usecase "answer" as q_ans_th
usecase "answerEn" as q_ans_en
usecase "difficulty" as q_diff
usecase "imageUrl" as q_img
usecase "audioUrl" as q_audio

questions -up- q_id
questions -up- q_cat
questions -up- q_text
questions -right- q_ans_th
questions -right- q_ans_en
questions -down- q_diff
questions -down- q_img
questions -down- q_audio

hexagon "Plays" as rel_plays

users "1" -right- rel_plays
rel_plays -right- "N" questions
@enduml
`;

const encoded = plantumlEncoder.encode(uml);
const url = 'https://www.plantuml.com/plantuml/png/' + encoded;

https.get(url, (res) => {
  const path = 'er_diagram.png';
  const writeStream = fs.createWriteStream(path);
  
  res.pipe(writeStream);
  
  writeStream.on('finish', () => {
    writeStream.close();
    console.log('Download Completed! Saved as er_diagram.png');
  });
}).on('error', (err) => {
  console.log('Error: ', err.message);
});
