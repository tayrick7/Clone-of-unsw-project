import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuthStore } from "../../stores";
import { Container, Row, Col, Alert } from 'react-bootstrap';
import SideBar from '../../components/PipelineSidebar';
import { Button } from 'react-bootstrap';
import axios from 'axios';


const UpdateDataSetPage = () => {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.loggedInStatus);
    const loggedInUser = useAuthStore((state) => state.loggedInUser);
    const [imageSrc, setImageSrc] = useState('/empty.png');
    const [file, setFile] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    if (!loggedInStatus) {
        history.push('/login');
    }

    const handleClick = async () => {
        const response = await uploadFileApi(loggedInUser, file);
        if (response.success) {
            alert('Upload successfully!');
            setImageSrc('/csv.png');
        } else {
            setErrorMessage(response.message);
            setImageSrc('/empty.png');
        }
    };

    const handleFileClick = (event) => {
        event.preventDefault();
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    useEffect(() => {
        if(file) {
            setImageSrc('/csv.png');
        } else {
            setImageSrc('/empty.png');
        }
    }, [file]);

    const uploadFileApi = async (user, file) => {
        const url = `${import.meta.env.VITE_API_URL}/api/dataset/`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('email', user);
    
        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Session-Token': localStorage.getItem('token')
                }
            });
    
            if (response.status === 400) {
                return { success: false, message: response.data.message };
            }
            return { success: true };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Upload failed due to an error.' };
        }
    };
    

    return (
        <Container className="init-page-container">
            <Row>
                <Col className="col-2">
                    <SideBar />
                </Col>
                <Col className="col-10">
                    <h1>Upload a new dataset</h1>
                    <img src={imageSrc} className='csv' alt="csv" />
                    <input type="file" className='select-file-button' onChange={handleFileClick} id="fileInput"></input>
                    <div className="d-flex justify-content-center align-items-center" style={{ gap: '80px' }}>
                        <Button variant="primary" onClick={handleClick}>Upload a file</Button>
                        <Button variant="primary" onClick={() => history.push('/pipeline/data')}>Next</Button>
                    </div>
                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                </Col>
            </Row>
        </Container>
    );
    
    
    
}

export default UpdateDataSetPage;
