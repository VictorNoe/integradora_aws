import React, {useEffect, useState} from "react";
import {Button, Form , Modal } from "react-bootstrap";
import {localhost, URLSERVIS} from "../../../plugins/Axios";
import swal from "sweetalert";


export const Form_Class = (props) =>{

    const [group, setGroup] = useState(null);
    const [materia, setMateria] = useState(null);
    const [profesor, setProfesor] = useState(null);
    const [docente, setDocente] = useState([])
    const [subject, setSubject] = useState([])
    const [grup, setGrup] = useState([])
    const [clas, setClas] = useState([])
    const [student, setStudent] = useState([])

    const allData = () => {
        props.onHide()
        setTimeout(() => {
            setProfesor(null)
            setMateria(null)
            setGroup(null)
        }, 500)
    }

    const getDocente = async () => {
        const res = await URLSERVIS("users/")
        setDocente(res.data.data)
    }
    const getSubject = async () => {
        const res = await URLSERVIS("subject/")
        setSubject(res.data.data)
    }
    const getGrupos = async () => {
        const res = await URLSERVIS("group/")
        setGrup(res.data.data)
    }
    const getClass = async () => {
        const res = await URLSERVIS("clas/")
        setClas(res.data.data)
    }
    const getStudents = async () => {
        const res = await URLSERVIS("student/")
        setStudent(res.data.data)
    }

    useEffect(()=> {
        getGrupos();
        getDocente();
        getSubject();
        getClass();
        getStudents();
    },[])

    console.log(student)
    const addClass = async () => {
        getGrupos()
        getDocente()
        getSubject()
        getClass()
        getStudents()
        let status = false
        let modal = false
        for (let i = 0; i < clas.length; i++) {
            if(clas[i].group.id === parseInt(group) && clas[i].subject.id === parseInt(materia)) {
                    status = true
                    swal({
                    title: "Registro fallida",
                    text: "Esta clase ya existe",
                    icon: "error",
                    button: false,
                    timer: 2000
                })
                break;
            }
        }

        if(status === false){
            for (let j = 0; j < student.length; j++) {
                if(student[j].group.id === parseInt(group)){
                    console.log("encontre alumno")
                    status = false;
                    break;
                } else {
                    status = true
                    modal = true
                }
            }
        }

        if(group !== "null" && materia !== "null" && profesor !== "null" && status !== true){
            await fetch(`http://${localhost}:8080/api/clas/`,{
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "status":1,
                    "group": {
                        "id":`${group}`
                    },
                    "teacher": {
                        "email":`${profesor}`
                    }
                    ,
                    "subject":{
                        "id":`${materia}`
                    },

                }),
            })
                .then( async (response)=>
                    await response.json())
                .then((data)=>{
                    swal({
                        title: "Registro Exitoso",
                        text: "Clase agregada",
                        icon: "success",
                        button: false,
                        timer: 1000
                    });
                    setTimeout(()=>{
                        window.location.reload();
                    },1000)
                })
                .catch((err)=> {
                    console.log(err)
                });

        }

        if (modal === true) {
            return swal({
                title: "Registro fallida",
                text: "No existen alumnos registrados para este grupo",
                icon: "error",
                button: false,
                timer: 2000
            });
        };

    }

    //Validation
    const [validated, setValidated] = useState(false);
      
    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
    }
    setValidated(true);
    };

    return(
        <div className="modal show" style={{ display: 'block', position: 'initial' }}>
      <Modal
          {...props}
          aria-labelledby="contained-modal-title-vcenter"
          centered
      >
          <Modal.Header>
              <Modal.Title>Nuevo Registro Clase</Modal.Title>
          </Modal.Header>

          <Modal.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>

                  <Form.Group className="mb-2" controlId="Name">
                      <Form.Label required type="text">Docente:</Form.Label>
                      <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                      <Form.Select required aria-label="Default select example" value={profesor} onChange={(e) => (setProfesor(e.target.value))}>
                          <option value="null">Selecciona Docente</option>
                          {docente.map((docente)=>(
                              <>
                                  {
                                      (docente.status === 1 && docente.role === 1)
                                      &&
                                      <option value={docente.email}>{docente.name} {docente.lastname}</option>
                                  }
                              </>
                          ))}
                      </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="Lastname">
                      <Form.Label>Materia:</Form.Label>
                      <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                      <Form.Select required aria-label="Default select example"  value={materia} onChange={(e) => (setMateria(e.target.value))}>
                          <option value="null">Selecciona Materia</option>
                          {subject.map((subject)=>(
                              <option value={subject.id}>{subject.name}</option>
                          ))}
                      </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2" controlId="Email">
                      <Form.Label>Grupo:</Form.Label>
                      <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                      <Form.Select required aria-label="Default select example" value={group} onChange={(e) => (setGroup(e.target.value))}>
                          <option value="null">Selecciona Grupo</option>
                          {grup.map((grup)=>(
                              <option value={grup.id}>{grup.degree}-.{grup.letter} {grup.career.name}</option>
                          ))}
                      </Form.Select>
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="success" type='submit' onClick={()=> addClass()}>Registrar</Button>
              <Button variant="danger" onClick={()=>(allData())}>Cancelar</Button>
          </Modal.Footer>
      </Modal>
    </div>
)}
