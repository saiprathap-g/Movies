const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertMovieDBObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDBObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `

        SELECT movie_name FROM movie; 
    `;
  const dbResponse = await db.all(getMoviesQuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//Get With Id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * FROM
         movie 
         WHERE 
         movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(convertMovieDBObjectToResponseObject(dbResponse));
});

//POST API

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
        '${movieName}',
        "${leadActor}"
      );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//put
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    
        UPDATE
         movie
          SET
           director_id = ${directorId},
           movie_name = '${movieName}',
           lead_actor = '${leadActor}'
           WHERE movie_id = ${movieId};
    
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `

      DELETE FROM movie WHERE movie_id = ${movieId};

    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//get directorTable
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `

        SELECT * FROM director; 
    `;
  const dbResponse = await db.all(getDirectorsQuery);
  response.send(
    dbResponse.map((eachDirector) =>
      convertDirectorDBObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieQuery = `
        SELECT movie_name FROM movie WHERE director_id = ${directorId};
    `;
  const dbResponse = await db.all(getMovieQuery);
  response.send(
    dbResponse.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
