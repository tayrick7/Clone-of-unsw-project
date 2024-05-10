import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import { Link, useHistory } from 'react-router-dom';
import { useAuthStore } from "../stores";
import axios from 'axios'

function Header() {
    const history = useHistory();
    const loggedInStatus = useAuthStore((state) => state.email) && true;

    const authButtons = loggedInStatus ? (
        <>
            <Button variant="secondary" onClick={() => handleLogout()}>Logout</Button>
        </>
    ) : (
        <>
            <Link to="/login"><Button variant="secondary">Login</Button></Link>  
        </>
    );

    const handleLogout = async () => {
        if (import.meta.env.MODE === 'production') {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/Authentication/logoff`)
        }
        useAuthStore.getState().logoff();
        history.push('/login');
    };

    return (
            <Navbar fixed="top">
                <Container>
                    <Row className="position-relative w-100 align-items-center">
                        <Col className="d-flex justify-content-start">
                            <Navbar.Brand className="d-flex" href="/">
                                <img src="/gptea.png" alt="LOGO" style={{ maxHeight: '100%', height: '80px', width: 'auto' }} />
                            </Navbar.Brand>
                        </Col>
                        <Col className="d-flex justify-content-end">
                            { authButtons }
                        </Col>
                    </Row>
                </Container>
            </Navbar>
    );
}

export default Header;
