async function unlockRiddle(team, locationPoints, clueId, scanKey, db, res) {
  try {
    /// Unlocks riddle by adding crackedClueTimestamp and setting crackedClue to true for a team.
    let unlockedClue = team.unlockedClues
    if (unlockedClue && !unlockedClue.crackedClue) {
      unlockedClue.crackedClue = true;
      unlockedClue.crackedClueTimestamp = new Date();
      unlockedClue.scanKey = scanKey;
      unlockedClue.score += locationPoints;
      team.lastSubmissionTimeStamp = new Date();
      team.score += locationPoints;
      await db.collection("teams").updateOne({ uid: team.uid }, { $set: team });
      res
        .status(200)
        .send(
          `You just earned ` +
            locationPoints +
            ` points ! Now solve the puzzle/activity given to you.`
        );
    } else {
      if (!unlockedClue) {
        res.status(400).send("Clue not unlocked yet");
      } else res.status(201).send("Riddle already unlocked");
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function unlockNextClueBypass(
  team,
  locationPoints,
  riddleObj,
  level,
  clueId,
  scanKey,
  db,
  res
) {
  try {
    /// Unlocks riddle by adding crackedClueTimestamp and setting crackedClue to true for a team.
    let unlockedClue = team.unlockedClues
    if (unlockedClue && !unlockedClue.crackedClue) {
      unlockedClue.crackedClue = true;
      unlockedClue.crackedRiddle = true;
      unlockedClue.crackedClueTimestamp = new Date();
      unlockedClue.crackedRiddleTimeStamp = new Date();
      unlockedClue.score += level.riddlePoints;
      unlockedClue.scanKey = scanKey;
      unlockedClue.score += locationPoints;
      team.score += level.riddlePoints;
      team.score += locationPoints;
      team.lastSubmissionTimeStamp = new Date();
      if (riddleObj.followclueId) {
        let followClue = await db
          .collection("clues")
          .findOne({ clueId: riddleObj.followclueId });
        if (!followClue)
          return res.send("You've completed all challenges!! Wohooo !!!");
        team.unlockedClues.push({
          clueId: followClue.clueId,
          level: followClue.level,
          isUnlocked: true,
          crackedClue: true,
          crackedRiddle: true,
          score: 0.0,
        });
      }
      await db.collection("teams").updateOne({ uid: team.uid }, { $set: team });
      return res
        .status(200)
        .send(
          `Looks like that was the last code to scan.. Congrats!! You're now a winner !`
        );
    } else {
      if (!unlockedClue) {
        res.status(400).send("Clue not unlocked yet");
      } else res.status(201).send("Riddle already unlocked");
    }
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function checkIfClueBelongsToLevel(req, res, db) {
  try {
    let clueId = req.body.clueId;
    let uid = req.body.uid;
    let scanKey = req.body.scanKey;
    console.log(req.body);

    let clue = await db.collection("clues").findOne({ clueId: clueId });
    let team = await db.collection("teams").findOne({ uid: uid });
    let levels = await db.collection("levels").find({}).toArray();

    if (!clue) {
      res.status(400).send("Invalid clueId");
      return false;
    }
    if (!team) {
      res.status(400).send("Invalid uid");
      return false;
    }

    console.log(levels);
    let level = levels.find(
      (lvl) => Array.isArray(lvl.clues) && lvl.clues.includes(clueId)
    );
    if (!level) {
      res.status(400).send("provided clueId not in the same level");
      return false;
    }

    let scanKeys = level.scanKeys;
    console.log(scanKeys);
    if (!scanKeys || !Array.isArray(scanKeys) || !scanKeys.includes(scanKey)) {
      res.status(400).send("provided scanKey not in the same level");
      return false;
    }

    let riddleObj = level.riddles.find((rid) => rid.scanKey === scanKey);

    // There is no riddle to this level
    if (riddleObj.answer === "" || !riddleObj.answer) {
      await unlockNextClueBypass(
        team,
        level.locationPoints,
        riddleObj,
        level,
        clueId,
        scanKey,
        db,
        res
      );
      return true;
    }

    await unlockRiddle(team, level.locationPoints, clueId, scanKey, db, res);

    return true;
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err);
    return false;
  }
}

// This method is called when the team reaches a location using the clue and scans the QR code.
module.exports = async function validateQRKey(req, res, db) {
  /** POST
   *  Required params
   *  clueId: The id of the clue.
   *  uid: The id of the team.
   *  answer: The answer submitted by the team to the clue.
   */

  let params = ["clueId", "scanKey", "uid"];
  for (let param of params) {
    if (!req.body[param]) {
      res.status(400).send("Missing parameter in request body: " + param);
      return;
    }
  }

  await checkIfClueBelongsToLevel(req, res, db);
};
