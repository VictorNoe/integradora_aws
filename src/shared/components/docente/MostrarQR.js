import {Modal} from "react-bootstrap";
import QRCode from "react-qr-code";
import swal from "sweetalert";
import {localhost} from "../../plugins/Axios";


export const MostrarQR = (props) => {
    const {qr,secs,mins,asistens,getAsisten} = props;

    //Destruye el codigo qr y no lo vuelve a consultar
    if(secs === 0 && mins === 0){
        props.qrCan()
    }

    //ELiminar las asistencias de ese qr
    const cancelarAsistencia = (id) => {
        for (let i = 0; i < asistens.length; i++) {
            if (parseInt(asistens[i].qr_id) === id){
                fetch(`http://${localhost}:8080/api/asistence/status`, {
                    method: "PUT",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "id": asistens[i].id,
                        "date": asistens[i].date,
                        "status": 3,
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
                    })
                    .catch((err) => {
                        getAsisten()
                        swal({
                            title: "Asistencias eliminadas",
                            text: "Las asistencias se han eliminado",
                            icon: "success",
                            timer: 1000,
                            button: false,
                        });
                        props.qrCan()
                    });
            }
        }
    };



    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center align-items-center">
                    <QRCode
                        size={256}
                        style={{ height: "auto", maxWidth: "35%", width: "35%" }}
                        value={`${qr.id}`}
                        viewBox={`0 0 256 256`}
                        level='M'
                    />
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Modal.Body>
                    <div className="text-center">
                        <div className="row">
                            <div className="col-2"/>
                            <div className="col-4">
                                <button className="btn btn-secondary" onClick={props.qrCan} disabled>{mins}:{secs}</button>
                            </div>
                            <div className="col-4">
                                <button className="btn btn-danger" onClick={()=>(cancelarAsistencia(qr.id))}>Cancelar QR</button>
                            </div>
                            <div className="col-2"/>
                        </div>
                    </div>
                </Modal.Body>
            </Modal.Footer>
        </Modal>
    );
}