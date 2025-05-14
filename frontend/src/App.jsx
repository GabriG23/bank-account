import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Homepage from './components/homepage';
import API from './API';

function App() {
  const [clientID, setClientID] = useState(1); // stato utente loggato
  const [check, setCheck] = useState(true)
  const [clientStatus, setClientStatus] = useState("");
  const [username, setUsername] = useState("");
  
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const data = await API.getClientUsername(clientID);
        setUsername(data.username);
      } catch (error) {
        console.error("Errore nel recupero dell'username", error);
      }
    };
    fetchUsername();
  }, [clientID]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await API.getClientStatus(clientID);
        if (data.client_status === 'ACTIVE' || data.client_status === 'SUSPENDED') {
          setCheck(true);
        } else {
          if (data.client_status === 'CLOSED') {
            setCheck(false);
          }
        }

        setClientStatus(data.client_status);
      } catch (error) {
        console.error("Errore nel recupero dello stato del cliente", error);
      }
    };
    fetchStatus();
  }, [clientID]);

  return (
    <Router>
      <Routes>
        <Route path='/' element={check ? <Homepage.HomepageOpen clientID={clientID} clientStatus={clientStatus} username={username} /> : <Homepage.HomepageClosed clientID={clientID} clientStatus={clientStatus} username={username}/>} />
      </Routes>
    </Router>
  );
}

export default App;






{/* <Route path="/client" element={<ClientPageWrapper />} /> */}
// function ClientPageWrapper() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     API.getUserInfo()
//       .then((data) => {
//         setUser(data);
//         setLoading(false);
//       })
//       .catch(() => {
//         navigate('/'); // se non autenticato, torna alla homepage
//       });
//   }, []);

//   const handleLogout = async () => {
//     await API.logOut();
//     navigate('/');
//   };

//   if (loading) return <div>Caricamento...</div>;

//   return <ClientPage user={user} action={handleLogout} />;
// }
