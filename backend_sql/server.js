const mysql = require('mysql');
// config file
const config = require('./config');

const express = require('express');
const cors = require('cors');
const app = express();

const port = config.express.port;

app.use(cors())
// force every file to be json
app.use(express.json());

const con = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    database: config.mysql.database,
    user: config.mysql.user,
    password: config.mysql.password
})

con.connect((error) => {
    if (error) {
        console.error('Error connecting to database:', error);
        return;
    }
    console.log('Connected to MySQL database successfully');
});

// app.use((req, res, next) => {
//     // console.log(req.rawHeaders)
//     console.log(`Incoming request: ${req.method} ${req.url}`);
//     next();
// });

// 2 command there are in server 1.req , 2.res -> ส่งข้อมูล

app.get('/', (req, res) => {
    res.send("Hello World!")
})


app.get('/rights', async (req, res) => {
    try {
        await con.query('SELECT * FROM rights', (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
            res.send({ "data": results })
        });
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
})

app.get('/patients', async (req, res) => {
    try {
        await con.query('SELECT * FROM patients', (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
            res.send({ "data": results })
        });
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
})

app.get('/patients/:searchText', async (req, res) => {
    const { params } = req;
    const searchText = params.searchText
    // console.log("text:", searchText)
    //  " select * from patients WHERE Name LIKE '%" + searchText + "%';"
    try {
        await con.query(`SELECT * FROM patients WHERE Name LIKE '%${searchText}%' `, (error, results, fields) => {
            if (error) {
                console.error('Error executing query:', error);
                return;
            }
            console.log('Results:', results);
            // console.log('normal \n', results)
            // console.log('****************************************************************************************\n')
            // console.log('json \n', JSON.stringify(results))
            res.status(200).send({ "data": results })
        });
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
})

app.post('/patients/create', async (req, res) => {
    const patient = req.body;
    console.log("patient-value: ", patient);

    // Using parameterized query to prevent SQL injection
    const insertSQL = "INSERT INTO patients (HN, Name, Patient_Rights_1, Patient_Rights_2, Patient_Rights_3, Chronic_Disease, Address, Phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        con.query(insertSQL, [patient.HN, patient.Name, patient.Right1, patient.Right2, patient.Right3, patient.Chronic, patient.Address, patient.Phone], function (err, results) {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send({ error: 'An error occurred while creating the patient record' });
                return;
            }
            console.log(patient.HN, patient.Name, " is created.");
            res.status(201).send({ message: 'Patient created successfully' });
        });
    } catch (err) {
        console.error('Error executing query:', err);
        res.status(500).send({ error: 'An error occurred while processing the request' });
    }
});

app.put('/patients/update', async (req, res) => {
    const patient = req.body;
    const patientID = patient.id;
    console.log(patient)
    const updateSQL = `
    UPDATE patients
    SET
        Name = ?,
        Patient_Rights_1 = ?,
        Patient_Rights_2 = ?,
        Patient_Rights_3 = ?,
        Chronic_Disease = ?,
        Address = ?,
        Phone = ?
        WHERE HN = ?
    `;
    try {
        await con.query(updateSQL, [patient.name, patient.right1 || null, patient.right2 || null, patient.right3 || null, patient.Chronic, patient.Address, patient.Phone, patientID], function (err, results) {
            if (err) {
                console.error('Error executing query:', err);
                // Handle error response
                res.status(200).send({ message: 'ไม่สามารถแก้ไขข้อมูลได้', status: 0 });
            }
            console.log('Patient with ID', patientID, 'is updated.');
            console.log(patient)
            res.setHeader('Content-Type', 'text/plain');
            // res.setHeader('Content-Type', 'application/json');
            res.status(200).send({ message: 'Patient updated successfully', status: 1 });
        });
    } catch (error) {
        console.error('Error executing query:', err);
        res.send({ error: 'An error occurred while processing the request', status: 0 });
    }
})

app.delete("/patients/delete/:Id", async(req,res)=>{
    var deleteSQL = "DELETE FROM patients WHERE HN=?;"
    const patient = req.params.Id
    console.log(patient)
    try {
        await con.query(deleteSQL, [patient], function (err, results) {
            if (err) {
                console.error('Error executing query:', err);
                // Handle error response
                res.status(200).send({ message: 'ไม่สามารถแก้ไขข้อมูลได้'});
            }
            console.log('Patient with ID', patient, 'is deleted.');
            // console.log(patient)
            res.status(200).send({ message: 'Patient deleted successfully'});
        });
    } catch (error) {
        console.error('Error executing query:', err);
        res.send({ error: 'An error occurred while processing the request', status: 0 });
    }
});

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).send("Sorry, the page you're looking for doesn't exist.");
});

app.listen(port, () => {
    console.log(`Exampleapplisteningathttp://localhost:${port}`)
})