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
        await con.query(insertSQL, [patient.HN, patient.name, patient.right1, patient.right2, patient.right3, patient.chronic, patient.address, patient.phone], function (err, results) {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).send({ error: 'An error occurred while creating the patient record' });
                return;
            }
            console.log(patient.HN, patient.name, " is created.");
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
    // const updateSQL = "UPDATE patients SET Name =?, SET Chronic_Disease =?, Address=?, Phone=?, Patient_Rights_1 =?, Patient_Rights_2 =?, Patient_Rights_3 =?  WHERE HN = ?";
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
    // let data = null;

    // await con.query('SELECT * FROM patients', (error, results, fields) => {
    //     if (error) {
    //         console.error('Error executing query:', error);
    //         data = { "data": results, "status": 0 };
    //     } else {
    //         data = { "data": results, "status": 1 };
    //     }
    //     // Move console.log inside the callback function
    //     console.log(data);
    // });

    // if(data.status == 1) {
    //     console.log(data)
    // }
    // console.log(patient)

    // res.status(200).send({ message: 'Patient updated successfully' });

    try {
        await con.query(updateSQL, [patient.name, patient.right1 || null, patient.right2 || null, patient.right3 || null,patient.Chronic,patient.Address, patient.Phone, patientID], function (err, results) {
            if (err) {
                console.error('Error executing query:', err);
                // Handle error response
                res.status(200).send({ message: 'ไม่สามารถแก้ไขข้อมูลได้', status:0});
            }
            console.log('Patient with ID', patientID, 'is updated.');
            console.log(patient)
            res.status(200).send({ message: 'Patient updated successfully', status:1});
        });
    } catch (error) {
        console.error('Error executing query:', err);
        res.send({ error: 'An error occurred while processing the request',status:0 });
    }

})

// Middleware to handle 404 errors
app.use((req, res, next) => {
    res.status(404).send("Sorry, the page you're looking for doesn't exist.");
});

app.listen(port, () => {
    console.log(`Exampleapplisteningathttp://localhost:${port}`)
})