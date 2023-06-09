const express = require("express");
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");
const path = require("path");
const PORT = process.env.BASE_URL || 5000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//Allow requests from all origins
app.use(cors());
// A random key for signing the cookie

module.exports = function (db) {
  /// Auth APIs
  app.post("/auth/login", (req, res) =>
     
    require("./api/auth/login")(req, res, db)

  );
app.post("/isAdmin",(req,res) =>
  require("./api/auth/adminLogin")(req, res, db)
);
  app.post("/auth/register", (req, res) =>
    require("./api/auth/register")(req, res, db)
  );

  /// Team APIs
  app.get("/teams/getTeams", (req, res) => {
    require("./api/teams/getTeams")(req, res, db);
  });

  app.post("/teams/deleteTeam", (req, res) => {
    require("./api/teams/deleteTeam")(req, res, db);
  });

  /// Clues APIs
  app.get("/clues/getAllClues", (req, res) => {
    require("./api/clues/getAllClues")(req, res, db);
  });



  app.get("/clues/getClue", (req, res) => {
    require("./api/clues/getClue")(req, res, db);
  });
  app.post("/clues/postClue", (req, res) => {
    require("./api/clues/postClue")(req, res, db);
  });
  app.post("/levels/postLevel", (req, res) => {
    require("./api/levels/postLevels")(req, res, db);
  });
  app.post("/clues/validateQRKey", (req, res) => {
    require("./api/clues/validateQRKey")(req, res, db);
  });
  app.post("/clues/submitRiddleAnswer", (req, res) => {
    require("./api/clues/submitRiddleAnswer")(req, res, db);
  });

  app.get("/getGameState", (req, res) => {
    require("./api/getGameState")(req, res, db);
  });

  app.get("/getTeam",(req,res)=>{
    require("./api/teams/getTeam")(req,res,db);
  })

  app.get("/getLeaderboard", (req, res) => {
    require("./api/leaderboard/getLeaderboard")(req, res, db);
  });
 
  app.get("/triggerInsertTeamsByCsv", (req, res) => {
    require("./api/auth/registerWithCSV")(req, res, db);
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static("../build/"));
    app.get("*", (req, res) => {
      console.log(__dirname);
      res.sendFile(path.resolve("../" + "build", "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("Cosmic Pursuit Server running");
    });
  }

  app.listen(PORT, () => {
    console.log(`STARDUST Game Server listening on port ${PORT}`);
  });
};
