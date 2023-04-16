import {Outlet, useNavigate, useParams} from "react-router-dom";
import {Navbar, Table} from "react-bootstrap";
import Button from "react-bootstrap/Button";
import React, {useEffect, useState} from "react";
import {Loading} from "../Loading";
import {URLSERVIS,localhost} from "../../plugins/Axios";
import {MostrarQR} from "./MostrarQR";
import { useTimer } from 'react-timer-hook';
import swal from "sweetalert";

export const TableStudens = () => {

    const {id} = useParams();
    const navigation = useNavigate();
    const time = new Date();

    const { seconds, minutes, restart } = useTimer({ time, onExpire: () => console.warn('onExpire called')});
    const fecha = new Date();
    const [post, setPost] = useState([]);
    const [clases, setClases] = useState([]);
    const [studens, setStudens] = useState([]);
    const [asistens, setAsistens] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [state, setState] = useState(true);
    const [getQR, setGetQR] = useState([]);
    const [inableeDoce, setInableeDoce] = useState([]);
    const [fechas, setFechas] = useState([]);

    useEffect(() => {

        fetch(`http://${localhost}:8080/api/clas/${id}`).then((res) => {
            return res.json();
        }).then((resp) => {
            if(Object.keys(resp).length===0) {
                alert("error");
            } else {
                setClases(resp.data);
            }
        })

        //Consultar
        const getStudens = async () => {
            const res1 = await URLSERVIS("student/");
            setStudens(res1.data.data)
        }
        getStudens();

        const getAsistence = async () => {
            fetch(`http://${localhost}:8080/api/asistence/${id}`).then((res) => {
                return res.json();
            }).then((resp) => {
                setAsistens(resp.data)
                var hash = {};
                resp.data = resp.data.filter(function(current) {
                    var exists = !hash[current.student_id];
                    hash[current.student_id] = true;
                    return exists;
                });
                setInableeDoce(resp.data);

            }).catch((err)=>{
                console.log(err)
            })
        }

        getDate()

        getAsistence()

        if (clases.status !== 1){
            setTimeout(()=>{

            },4000)
        }

    },  [1000]);

    //
    const getDate = () => {
        fetch(`http://${localhost}:8080/api/qr/`).then((res) => {
            return res.json();
        }).then((resp) => {
            setFechas(resp.data);
        })
    }

    //Update status
    const updateQr = async () => {
        console.log(getQR)
        await fetch(`http://${localhost}:8080/api/qr/`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": getQR.id,
                "date": getQR.date,
                "status": 0,
                "clas": {
                    "id": getQR.clas.id
                }
            }),
        })
            .then((response) =>
                response.json())
            .then((data) => {
            }).catch((err) => {
                console.log(err)
            });
    }

    //Consulta todas las asistencia
    const getAsistence = async () => {
        fetch(`http://${localhost}:8080/api/asistence/${id}`).then((res) => {
            return res.json();
        }).then((resp) => {
            setAsistens(resp.data)
        }).catch((err)=>{
            console.log(err)
        })
    }

    //Genera un nuevo qr
    const insert = async () => {
        await fetch(`http://${localhost}:8080/api/qr/`, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "date": `${fecha.toISOString()}`,
                "status": 1,
                "clas": {
                    "id": `${clases.id}`,
                    "group":{
                        "id":`${clases.group.id}`
                    }
                }
            }),
        })
            .then(async (response) =>
                await response.json())
            .then(async (data) => {
                await localStorage.setItem("status", data.data.id)
                setGetQR(data.data)
                setPost(data.data);
                getAsistence()
                getDate()
            }).catch((err) => {
                console.log(err)
            });
    }

    //Valida el tiempo
    const times = () => {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 15);
        restart(time)
    }

    //Finaliza a todos los alumnos a un nuevo cuatrimestre
    const finalizarCuatri = async () => {
        await fetch(`http://${localhost}:8080/api/clas/`, {
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "id": `${clases.id}`,
                "status": `0`,
                "group": {
                    "id": `${clases.group.id}`
                },
                "user":{
                    "email":`${clases.emailTeacher}`
                },
                "subject": {
                    "id": `${clases.subject.id}`
                }
            }),
        })
            .then(async (response) =>
                await response.json())
            .then((data) => {
                setTimeout(()=> {
                    navigation("/loginDte")
                },1000)
            })
            .catch((err) => {
                console.log(err)
            });
    }

    //Procentajes asistencias
    const asissPorcc = (id) => {
        let contador1 = 0;
        let contador2 = 0;
        for (let i = 0; i < asistens.length; i++) {
            if (asistens[i].student_id === id){
                if(asistens[i].status < 3) {
                    contador1++;
                }
                if(asistens[i].status !== 0 && asistens[i].status !== 3) {
                    contador2++;
                }
            }
        }
        if (contador1 !== 0 && contador2 !== 0){
            return ((contador2/contador1) * 100).toFixed(2)
        }
            return (0).toFixed(2)
    }

    //actualizar asistencia de todos
    const updateInvididual = (asistencia1,id) => {
        for (let i = 0; i < asistens.length; i++) {
            if (asistencia1 === 'x'){
                if (asistens[i].id === id && asistens[i].status === 0){
                    fetch(`http://${localhost}:8080/api/asistence/status`, {
                        method: "PUT",
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "id": asistens[i].id,
                            "date": asistens[i].date,
                            "status": 2,
                            "qr":{
                                "id":asistens[i].qr_id
                            } ,
                            "student":{
                                "id": asistens[i].student_id
                            }
                        })
                    })
                        .then(async (response) =>
                            await response.json())
                        .then((data) => {
                            getDate()
                            getAsistence()
                        })
                        .catch((err) => {
                            getDate()
                            getAsistence()
                        });
                }
            }
            getDate()
            getAsistence()
        }
    }

    if (modalShow === false){
            updateQr()
    }

    if(!clases.subject) return <Loading/>

    return(
        <>
            <div className="container-fluid mt-3">
                <div style={{backgroundColor:"#D9D9D9"}}>
                    <Navbar style={{backgroundColor:"#255770FF"}}>
                        <div className="container-fluid">
                            <Navbar.Brand style={{color:"#FFF"}}>{clases.subject.name} {clases.group.degree}-{clases.group.letter}</Navbar.Brand>
                            <Navbar.Toggle/>
                            <Navbar.Collapse className="justify-content-end">
                                {
                                    !state
                                    &&
                                    <Button className="btn btn-secondary" disabled>{minutes}:{seconds}</Button>
                                }
                                {
                                    state
                                        ?
                                        <>
                                            { clases.status === 1
                                                ? <Button style={{backgroundColor:"#109175", borderColor:"#109175"}} onClick={() => (setModalShow(true),setState(false),insert(),times())}>Generar QR</Button>
                                                : <></>
                                            }
                                        </>
                                        : <Button style={{backgroundColor:"#109175", borderColor:"#109175"}} onClick={() => setModalShow(true)}>Mostrar QR</Button>
                                }
                            </Navbar.Collapse>
                        </div>
                        <MostrarQR
                            show={modalShow}
                            qrState={state}
                            clase={clases.group.degree}
                            onHide={() => (setModalShow(false))}
                            qrCan={()=> (setState(true),setModalShow(false),localStorage.clear())}
                            qr={post}
                            secs = {seconds}
                            mins = {minutes}
                            localhost = {localhost}
                            asistens = {asistens}
                            getAsisten = {()=>(getAsistence(),getDate())}
                        />
                    </Navbar>
                    <div className="container-fluid mb-3">
                        <div style={{overflowY: "hidden", overflowX:"auto", width:"100%"}}>
                            <Table bordered hober className="mt-3">
                                <thead style={{backgroundColor:"#255770FF",borderColor:"black",color:"white"}}>
                                <tr>
                                    <th style={{width:"50px", textAlign:"center"}}>Matricula</th>
                                    <th>Nombres<a style={{color:"transparent"}}>_</a>completo<a style={{color:"transparent"}}>_______________</a></th>
                                    <>
                                        {fechas.map((fechas,index)=>(
                                            <>
                                                {asistens.map((ass)=>(
                                                    <>
                                                        {(ass.status <= 2 && fechas.idClas === parseInt(id) && ass.qr_id === fechas.id && inableeDoce[0].student_id === ass.student_id)
                                                            &&
                                                            <th key={index} style={{width:"70px",textAlign:"center"}}>{` ${fechas.date.slice(5,10)}`}</th>}
                                                    </>
                                                ))}
                                            </>
                                        ))}
                                    </>
                                    <th style={{width:"40px"}}>Porcentaje</th>
                                </tr>
                                </thead>
                                { clases.status === 1
                                    ?
                                    <tbody style={{backgroundColor:"#FFF",borderColor:"black"}} className="mb-3">
                                    {studens.map((studen,index) => (
                                        <>
                                            {((studen.group.degree === clases.group.degree) && (studen.group.letter === clases.group.letter))
                                                &&
                                                <tr key={index}>
                                                    <td>{studen.id}</td>
                                                    <td>{`${studen.name} ${studen.lastname}`}</td>
                                                    <>
                                                        {asistens.map((asistens)=>(
                                                            <>
                                                                { (studen.id === asistens.student_id && asistens.status <= 2)
                                                                    &&
                                                                    <td className="text-center">
                                                                        <input
                                                                            style={modalShow !== true ? {fontSize:"20px",width:"50px",border:"hidden",outline:"none"} : {fontSize:"20px",width:"50px",textAlign:"center",border:"hidden", backgroundColor:"white"}}
                                                                            type="text"
                                                                            className="form-control"
                                                                            defaultValue ={(asistens.status === 0 && "/")||(asistens.status === 1 && "•")||(asistens.status === 2 && "x")}
                                                                            className="text-center"
                                                                            maxlength="1"
                                                                            onChange={(e)=>(updateInvididual(e.target.value,asistens.id))}
                                                                            disabled={modalShow !== true ? false : true}
                                                                        />
                                                                    </td>
                                                                }
                                                            </>
                                                        ))}
                                                    </>
                                                    <td>
                                                        <button className={80.0 <= asissPorcc(studen.id) ? "btn btn-secondary" : "btn btn-warning"} disabled>
                                                            {asissPorcc(studen.id)}%
                                                        </button>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    ))
                                    }
                                    </tbody>
                                    :
                                    <tbody style={{backgroundColor:"#FFF",borderColor:"black"}} className="mb-3">
                                    {inableeDoce.map((studen,index) => (
                                        <>
                                                <tr key={index}>
                                                    <td>{studen.student_id}</td>
                                                    <td>{`${studen.name} ${studen.lastname}`}</td>
                                                    <>
                                                        {asistens.map((asistens)=>(
                                                            <>
                                                                { (studen.student_id === asistens.student_id && asistens.status <= 2)
                                                                    &&
                                                                    <td>
                                                                        <input
                                                                            style={{fontSize:"20px",width:"50px",textAlign:"center",border:"hidden", backgroundColor:"white"}}
                                                                            type="text"
                                                                            defaultValue ={(asistens.status === 0 && "/")||(asistens.status === 1 && "•")||(asistens.status === 2 && "x")}
                                                                            className="text-center"
                                                                            disabled
                                                                        />
                                                                    </td>
                                                                }
                                                            </>
                                                        ))}
                                                    </>
                                                    <td>
                                                        <button className={80.0 <= asissPorcc(studen.student_id) ? "btn btn-secondary" : "btn btn-warning"} disabled>
                                                            {asissPorcc(studen.student_id)}%
                                                        </button>
                                                    </td>
                                                </tr>
                                        </>
                                    ))
                                    }
                                    </tbody>
                                }
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
            {
                clases.status === 1
                    ?<a className="btn-flotante" onClick={()=> (
                        swal({
                            title: "¿Seguro quieres terminar la clase?",
                            text: "Finalizando la clase no se podra hacer cambios",
                            icon: "warning",
                            buttons: ["cancelar","aceptar"],
                            dangerMode: true,
                        })
                            .then((willDelete) => {
                                if (willDelete) {
                                    swal({
                                        title: "Clase finalizada",
                                        text: "La clase se a finalizado",
                                        icon: "success",
                                        button: false,
                                        timer:2000,
                                        value: finalizarCuatri()
                                    })
                                }
                            })
                    )}>Finalizar Clase</a>
                    :<></>
            }
            <Outlet/>
        </>
    )
}
