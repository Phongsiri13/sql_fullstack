var lastestHN;
var rightList;
var options;

var filter_options;

//////////////////////////////////// show right options ///////////////////////////////////
const xhttp = new XMLHttpRequest();
xhttp.open("GET", "http://localhost:3000/rights/");
xhttp.send();
xhttp.onreadystatechange = function () {
	if (this.readyState == 4 && this.status == 200) {
		rightList = JSON.parse(this.responseText).data;
		// console.log(rightList[0].Patient_Rights)

		options += "<option disabled selected value> -- select an option -- </option>"

		for (let i = 0; i < rightList.length; i++) {
			// console.log(rightList[i].Patient_Rights)
			let opt = "<option value=" + rightList[i].Patient_Rights + ">" + rightList[i].Patient_Rights + "</option>"
			options += opt
		}
		filter_options = options.match(/<option[^>]*>(.*?)<\/option>/g);
		// console.log("ooop", filter_options)
	}
}
//////////////////////////////////// show right options ///////////////////////////////////

//////////////////////////////////// Load Table ///////////////////////////////////
function loadTable() {
	const xhttp = new XMLHttpRequest();
	xhttp.open("GET", "http://localhost:3000/patients/");
	xhttp.send();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			// console.log(this.responseText);
			var trHTML = "";
			var num = 1;
			const objects = JSON.parse(this.responseText);
			// console.log(objects)
			for (var object of objects.data) {
				var sss = JSON.stringify(object)
				// console.log(sss)
				trHTML += "<tr>";
				trHTML += "<td>" + num + "</td>";
				trHTML += "<td>" + object["HN"] + "</td>";
				trHTML += "<td>" + object["Name"] + "</td>";
				trHTML += "<td>" + (object["Patient_Rights_1"] == null ? "" : object["Patient_Rights_1"]) + "</td>";
				trHTML += "<td>" + (object["Patient_Rights_2"] == null ? "" : object["Patient_Rights_2"]) + "</td>";
				trHTML += "<td>" + (object["Patient_Rights_3"] == null ? "" : object["Patient_Rights_3"]) + "</td>";
				trHTML += "<td>" + object["Chronic_Disease"] + "</td>";
				trHTML += "<td>" + object["Address"] + "</td>";
				trHTML += "<td>" + object["Phone"] + "</td>";
				// trHTML += '<td><i class="btn text-primary bi bi-pencil-square" id="edits" onclick="showEditbox(`'+ object["HN"] +'`)" ></i>';
				// trHTML += '<i class = "btn text-danger bi bi-trash3-fill" onclick="patientDelete(' +object["ID"] +')"></i></td>';
				num++;

				var box_td = document.createElement('td')
				var edits = document.createElement('i')
				var dele = document.createElement('i')

				edits.className = 'btn text-primary bi bi-pencil-square';
				dele.className = 'btn text-danger bi bi-trash3-fill'

				edits.setAttribute('onclick', `showEditbox(${JSON.stringify(object)})`);

				// edits.innerText = "dsadsa"
				box_td.appendChild(edits)
				box_td.appendChild(dele)

				trHTML += box_td.outerHTML
				trHTML += "</tr>";

				lastestHN = object["HN"];
				document.getElementById("patientTable").innerHTML = trHTML;
			}
		}
	};
}


loadTable();
//////////////////////////////////// Load Table ///////////////////////////////////

////////////////////////////////// DELETE /////////////////////////////////

function patientDelete(id) {
	console.log("Delete: ", id);
	const xhttp = new XMLHttpRequest();
	xhttp.open("DELETE", "http://localhost:3000/patients/delete/" + id);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4) {
			Swal.fire("Good job!", "ลบข้อมูลผู้ป่วยสำเร็จ", "success");
			loadTable();
		} else {
			Swal.fire("Failed!", "ลบข้อมูลผู้ป่วยไม่สำเร็จ", "error");
			loadTable();
		}
	};
}

////////////////////////////////// DELETE /////////////////////////////////

/////////////////////////////////// INSERT NEW INFO //////////////////////////////////

function showUserCreateBox() {

	Swal.fire({
		title: 'เพิ่มข้อมูลผู้ป่วย',
		html:
			'<div class="mb-3"><label for="HN" class="form-label float-start">HN</label>' +
			'<input class="form-control" id="HN" placeholder="HN" value="' + "WU" + (parseInt(lastestHN.replaceAll("WU", "")) + 1) + '" disabled></div>' +

			'<div class="mb-3"><label for="Name" class="form-label float-start">ชื่อ-สกุลผู้ป่วย</label>' +
			'<input class="form-control" id="Name" placeholder="ชื่อ สกุล"></div>' +

			'<div class="mb-3"><label for="Right1" class="form-label float-start">สิทธิการรักษา 1</label>' +
			'<select class="form-select form-select-sm" id="Right1">' + options + '</select></div>' +

			'<div class="mb-3"><label for="Right2" class="form-label float-start">สิทธิการรักษา 2</label>' +
			'<select class="form-select form-select-sm" id="Right2">' + options + '</select></div>' +

			'<div class="mb-3"><label for="Right3" class="form-label float-start">สิทธิการรักษา 3</label>' +
			'<select class="form-select form-select-sm" id="Right3">' + options + '</select></div>' +

			'<div class="mb-3"><label for="Chronic" class="form-label float-start">โรคประจำตัว</label>' +
			'<input class="form-control" id="Chronic" placeholder="เช่น ความดันโลหิตสูง, ไขมัน, เบาหวาน"></div>' +

			'<div class="mb-3"><label for="Address" class="form-label float-start">ที่อยู่</label>' +
			'<input class="form-control" id="Address" placeholder="บ้านเลขที่ หมู่บ้าน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"></div>' +

			'<div class="mb-3"><label for="Phone" class="form-label float-start">เบอร์ติดต่อ</label>' +
			'<input class="form-control" id="Phone" placeholder="0XX XXX XXXX"></div>',

		focusConfirm: false,
		showCancelButton: true,
		cancelButtonText: 'ยกเลิก',
		confirmButtonText: 'บันทึก',
		preConfirm: () => {
			createNewPatient();
		}
	})
}


function createNewPatient() {
	const HN = document.getElementById("HN").value;
	const Name = document.getElementById("Name").value;
	const Right1 = document.getElementById("Right1").value;
	const Right2 = document.getElementById("Right2").value;
	const Right3 = document.getElementById("Right3").value;
	const Chronic = document.getElementById("Chronic").value;
	const Address = document.getElementById("Address").value;
	const Phone = document.getElementById("Phone").value;

	console.log(JSON.stringify({
		'HN': HN,
		'Name': Name,
		'Right1': Right1,
		'Right2': Right2,
		'Right3': Right3,
		'Chronic': Chronic,
		'Address': Address,
		'Phone': Phone,

	}));

	const xhttp = new XMLHttpRequest();
	xhttp.open('POST', 'http://localhost:3000/patients/create');
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send(JSON.stringify({
		'HN': HN,
		'Name': Name,
		'Right1': Right1,
		'Right2': Right2,
		'Right3': Right3,
		'Chronic': Chronic,
		'Address': Address,
		'Phone': Phone,

	}));
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			Swal.fire(
				'Good job!',
				'เพิ่มข้อมูลผู้ป่วยสำเร็จ',
				'success'
			);
			loadTable();
		} else {
			Swal.fire(
				'Failed!',
				'เพิ่มข้อมูลผู้ป่วยไม่สำเร็จ',
				'error'
			);
			loadTable();
		}
	};
}


// for update select rights
function updateMatch(right_word) {
	// var optionsArray = options.match(/<option[^>]*>(.*?)<\/option>/g);
	// clone options with array
	var optionsArray = filter_options.slice()
	var wordToFind = right_word;
	// console.log(optionsArray)

	var positions = [];
	// optionsArray.forEach((option, index) => {
	// 	if (option.match(`value=${wordToFind}`)) {
	// 		positions.push(index);
	// 	}
	// });

	// filter data matching on middle
	const regex = new RegExp("\\b" + wordToFind + "\\b");

	// Find matches
	// positions = optionsArray.filter(item => regex.test(item));
	// return only 1
	positions = optionsArray.reduce((acc, item, index) => {
		if (regex.test(item)) {
			acc.push(index);
		}
		return acc;
	}, []);

	console.log(positions);

	// if data is null
	var newOption = "<option value=''> -- select an option -- </option>"

	console.log("Positions where the word '" + wordToFind + "' is found:", positions);
	// console.log(`value=${wordToFind}`)

	if (optionsArray.some(option => option.match(`value=${wordToFind}`))) {
		// console.log("The word '" + wordToFind + "' is found in the optionsArray.");
		optionsArray[positions] = `<option value=${wordToFind} selected>${wordToFind}</option>`
		delete optionsArray[0]
		optionsArray[0] = newOption
		// console.log(optionsArray)
		return optionsArray
	} else {
		// console.log("The word '" + wordToFind + "' is not found in the optionsArray.");
		return options
	}
}

async function showEditbox(obj_data) {
	console.log(obj_data['HN'])
	// console.log(obj_data.Patient_Rights_1)

	var formValues = await Swal.fire({
		title: 'เพิ่มข้อมูลผู้ป่วย',
		html:
			'<div class="mb-3"><label for="HN" class="form-label float-start">HN</label>' +
			'<input class="form-control" id="HN" placeholder="HN" value="' +  obj_data['HN'] + '" disabled></div>' +

			'<div class="mb-3"><label for="Name" class="form-label float-start">ชื่อ-สกุลผู้ป่วย</label>' +
			'<input class="form-control" id="Name" placeholder="ชื่อ สกุล" value="' + obj_data['Name'] + '" ></div>' +

			'<div class="mb-3"><label for="Right2" class="form-label float-start">สิทธิการรักษา 1</label>' +
			'<select class="form-select form-select-sm" id="Right1">' + updateMatch(obj_data.Patient_Rights_1) + '</select></div>' +

			'<div class="mb-3"><label for="Right2" class="form-label float-start">สิทธิการรักษา 2</label>' +
			'<select class="form-select form-select-sm" id="Right2">' + updateMatch(obj_data.Patient_Rights_2) + '</select></div>' +

			'<div class="mb-3"><label for="Right3" class="form-label float-start">สิทธิการรักษา 3</label>' +
			'<select class="form-select form-select-sm" id="Right3">' + updateMatch(obj_data.Patient_Rights_3) + '</select></div>' +

			'<div class="mb-3"><label for="Chronic" class="form-label float-start">โรคประจำตัว</label>' +
			'<input class="form-control" id="Chronic" placeholder="เช่น ความดันโลหิตสูง, ไขมัน, เบาหวาน" value=' + obj_data.Chronic_Disease + '></div>' +

			'<div class="mb-3"><label for="Address" class="form-label float-start">ที่อยู่</label>' +
			'<textarea class="form-control" placeholder="เช่น 45, London" id="Address">' + obj_data.Address + '</textarea>' +

			'<div class="mb-3"><label for="Phone" class="form-label float-start">เบอร์ติดต่อ</label>' +
			'<input class="form-control" id="Phone" placeholder="0XX XXX XXXX" value=' + obj_data.Phone + '></div>',

		focusConfirm: false,
		showCancelButton: true,
		cancelButtonText: 'ยกเลิก',
		confirmButtonText: 'บันทึก',
		preConfirm: () => {
			return {
				"id": obj_data["HN"],
				"right1": document.getElementById("Right1").value,
				"right2": document.getElementById("Right2").value,
				"right3": document.getElementById("Right3").value,
				"name": document.getElementById("Name").value,
				"Chronic": document.getElementById("Chronic").value,
				"Address": document.getElementById("Address").value,
				"Phone": document.getElementById("Phone").value
			}
		}
	})

	// console.log(formValues)
	if (formValues.isConfirmed) {
		// Swal.fire(JSON.stringify(formValues));
		// update specific
		// console.log(JSON.stringify(formValues))
		console.log(formValues.value)
		// console.log("HN1:",formValues.value.id, "HN2:",obj_data.HN)

		var data = formValues.value

		if (data.id == obj_data.HN) {

			// form detect
			if(data.Phone){
				if(data.Phone>= 10){
					const phoneNumber = data.Phone;
					const formattedPhoneNumber = phoneNumber.slice(0, 3) + "-" + phoneNumber.slice(3, 6) + "-" + phoneNumber.slice(6);
					data['Phone'] = formattedPhoneNumber
				}
			}

			// update data
			const xhttp = new XMLHttpRequest();
			xhttp.open("PUT", "http://localhost:3000/patients/update");
			xhttp.setRequestHeader("Content-Type", "application/json");
			xhttp.send(JSON.stringify(data));

			xhttp.onreadystatechange = async function () {
				if (this.readyState == 4 && this.status == 200) {
					const objects = JSON.parse(this.responseText);
					console.log(objects)
					// error success
					var ud = await Swal.fire({
						icon: `${objects.status == 1 ? 'success' : 'error'}`,
						title: `${objects.message}`,
					})

					console.log(ud)
					if (ud.isConfirmed) {
						loadTable();
					}

				}
			}

		}
		else {
			// can not update
			await Swal.fire({
				icon: `error`,
				title: `ไม่สามารถเปลี่ยนแปลงอัพเดทข้อมูลได้`,
			})
		}
	}
}