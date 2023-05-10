const mysql = require("mysql2");
const http = require("http");
const url = require("url");

const connection = mysql.createConnection({
  host: "",
  user: "",
  
  database: "Airline",
});

const server = http.createServer(function (request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "GET" && request.url === "/countAllAirports") {
    connection.query(
      "SELECT COUNT(*) AS count FROM Airport",
      function (error, results, fields) {
        if (error) {
          console.error(error);
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.end("Internal Server Error");
        } else {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(results));
        }
      }
    );
  } else if (request.method === "GET" && url.pathname === "/carriers") {
    const searchTerm = url.searchParams.get("opCarrier");

    if (!searchTerm) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing search term");
    } else {
      connection.query(
        `SELECT * FROM Carrier WHERE OP_CARRIER LIKE '%${searchTerm}%'`,
        function (error, results, fields) {
          if (error) {
            console.error(error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(results));
          }
        }
      );
    }
  } else if (request.method === "GET" && request.url.startsWith("/airports")) {
    const urlParams = new URLSearchParams(url.search);
    const origin = urlParams.get("origin");
    const dest = urlParams.get("dest");

    if (!origin || !dest) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing origin or dest parameter");
    } else {
      connection.query(
        `SELECT * FROM Airport WHERE origin='${origin}' AND dest='${dest}'`,
        function (error, results, fields) {
          if (error) {
            console.error(error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(results));
          }
        }
      );
    }
  } else if (
    request.method === "GET" &&
    url.pathname.startsWith("/flightsID")
  ) {
    const flight_id = url.searchParams.get("flight_id");

    if (!flight_id) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing flight_id parameter");
    } else {
      connection.query(
        `SELECT * FROM Flights WHERE flight_id=${flight_id}`,
        function (error, results, fields) {
          if (error) {
            console.error(error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          } else if (results.length === 0) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.end("Flight not found");
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(results[0]));
          }
        }
      );
    }
  } else if (
    request.method === "GET" &&
    url.pathname.startsWith("/flightsinfo")
  ) {
    const queryParams = url.searchParams;

    // const flightID = queryParams.get("flightID");
    const FL_DATE = queryParams.get("FL_DATE");
    const Carrier_id = queryParams.get("Carrier_id");
    const OP_CARRIER_FL_NUM = queryParams.get("OP_CARRIER_FL_NUM");
    const Airport_id = queryParams.get("Airport_id");

    let query = "SELECT * FROM Flights WHERE ";
    let queryConditions = [];

    // if (flightID) {
    // queryConditions.push(`flightID = ${flightID}`);
    // }

    if (FL_DATE) {
      queryConditions.push(`FL_DATE = '${FL_DATE}'`);
    }

    if (Carrier_id) {
      queryConditions.push(`Carrier_id = ${Carrier_id}`);
    }

    if (OP_CARRIER_FL_NUM) {
      queryConditions.push(`OP_CARRIER_FL_NUM = ${OP_CARRIER_FL_NUM}`);
    }

    if (Airport_id) {
      queryConditions.push(`Airport_id = ${Airport_id}`);
    }

    if (queryConditions.length === 0) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing search parameters");
    } else {
      query += queryConditions.join(" AND ");

      connection.query(query, function (error, results, fields) {
        if (error) {
          console.error(error);
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.end("Internal Server Error");
        } else if (results.length === 0) {
          response.writeHead(404, { "Content-Type": "text/plain" });
          response.end("No flights found");
        } else {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(results));
        }
      });
    }
  } else if (request.method === "DELETE" && url.pathname === "/deleteflight") {
    const flight_id = url.searchParams.get("flight_id");
    if (!flight_id) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing flight ID parameter");
    } else {
      connection.query(
        `DELETE FROM FlightTable WHERE flight_id=${flight_id}`,
        function (error, results, fields) {
          if (error) {
            console.error(error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          } else if (results.affectedRows === 0) {
            response.writeHead(404, { "Content-Type": "text/plain" });
            response.end("Flight not found");
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({ message: "Flight deleted successfully" })
            );
          }
        }
      );
    }
  } else if (
    request.method === "PUT" &&
    url.pathname.startsWith("/editflights")
  ) {
    const queryParams = url.searchParams;
    const flight_id = queryParams.get("flight_id");

    if (!flight_id) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing flightID parameter");
    } else {
      let body = "";

      request.on("data", (data) => {
        body += data;
      });

      request.on("end", () => {
        const flightData = JSON.parse(body);
        const query = `UPDATE Flights SET ? WHERE flight_id = ?`;

        connection.query(
          query,
          [flightData, flight_id],
          function (error, results, fields) {
            if (error) {
              console.error(error);
              response.writeHead(500, { "Content-Type": "text/plain" });
              response.end("Internal Server Error");
            } else if (results.affectedRows === 0) {
              response.writeHead(404, { "Content-Type": "text/plain" });
              response.end(`Flight ${flight_id} not found`);
            } else {
              response.writeHead(200, { "Content-Type": "text/plain" });
              response.end(`Flight ${flight_id} updated successfully`);
            }
          }
        );
      });
    }
  } else {
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("Page not found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

connection.connect(function (error) {
  if (error) {
    console.error(error);
    process.exit(1);
  } else {
    console.log("Connected to database");
  }
});

/* 
else if (request.method === "GET" && url.pathname.startsWith("/flights")) {
    const flightID = url.searchParams.get("flightID");
    const flDate = url.searchParams.get("flDate");
    const carrierID = url.searchParams.get("carrierID");
    const opCarrierFlNum = url.searchParams.get("opCarrierFlNum");
    const airportID = url.searchParams.get("airportID");

    if (!flightID && !flDate && !carrierID && !opCarrierFlNum && !airportID) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing search parameters");
    } else if (flightID) {
      connection.query(
        `SELECT * FROM Flight WHERE flightID=${flightID}`,
        function (error, results, fields) {
          if (error) {
            console.error(error);
            response.writeHead(500, { "Content-Type": "text/plain" });
            response.end("Internal Server Error");
          } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(results));
          }
        }
      );
    }
  }
*/

/* 
The code block handle HTTP PUT requests targeting the "/editflights" endpoint.
The second code block uses the searchParams.get() method to extract the flightID parameter from the URL query string.
 It then collects the request body as a string and parses it as JSON. 
Instead of manually constructing the SQL query, it uses a parameterized query with placeholders for the flight data and flightID values, 
which are provided as an array to the connection.query method.

This code block uses a parameterized query with placeholders, 
which is generally considered a best practice for security reasons as it helps prevent SQL injection attacks.
*/

/* 
else if (
    request.method === "PUT" &&
    url.pathname.startsWith("/editflights")
  ) {
    const queryParams = url.searchParams;
    const flightID = queryParams.get("flightID");

    if (!flightID) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Missing flightID parameter");
    } else {
      let body = "";

      request.on("data", (data) => {
        body += data;
      });

      request.on("end", () => {
        const flightData = JSON.parse(body);
        const query = `UPDATE Flight SET ? WHERE flightID = ?`;

        connection.query(
          query,
          [flightData, flightID],
          function (error, results, fields) {
            if (error) {
              console.error(error);
              response.writeHead(500, { "Content-Type": "text/plain" });
              response.end("Internal Server Error");
            } else if (results.affectedRows === 0) {
              response.writeHead(404, { "Content-Type": "text/plain" });
              response.end(`Flight ${flightID} not found`);
            } else {
              response.writeHead(200, { "Content-Type": "text/plain" });
              response.end(`Flight ${flightID} updated successfully`);
            }
          }
        );
      });
    }
  }
*/

/* 
The code block handle HTTP PUT requests targeting the "/editflights" endpoint.
The following code block uses the on("data") and on("end") methods to collect the request body as a string and then parse it as JSON. 
It then manually constructs the SQL query using the parsed request data and sends it to the database using the connection.query method.
*/
/* 
else if (
    request.method === "PUT" &&
    url.pathname.startsWith("/editflights")
  ) {
    let requestBody = "";

    request.on("data", (data) => {
      requestBody += data;
    });

    request.on("end", () => {
      const requestData = JSON.parse(requestBody);
      const flightID = requestData.flightID;

      // Check if flightID is provided in the request body
      if (!flightID) {
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("Missing flightID in the request body");
        return;
      }

      // Construct the SQL query to update the Flight record
      let query = "UPDATE Flight SET ";

      Object.keys(requestData).forEach((key) => {
        if (key !== "flightID") {
          query += `${key} = '${requestData[key]}', `;
        }
      });

      query = query.slice(0, -2); // Remove the last comma and space
      query += ` WHERE flightID = ${flightID}`;

      connection.query(query, function (error, results, fields) {
        if (error) {
          console.error(error);
          response.writeHead(500, { "Content-Type": "text/plain" });
          response.end("Internal Server Error");
        } else if (results.affectedRows === 0) {
          response.writeHead(404, { "Content-Type": "text/plain" });
          response.end(`Flight record with ID ${flightID} not found`);
        } else {
          response.writeHead(200, { "Content-Type": "text/plain" });
          response.end(
            `Flight record with ID ${flightID} updated successfully`
          );
        }
      });
    });
  }
*/
