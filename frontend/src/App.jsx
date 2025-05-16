import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomepageClosed from './components/homepage';
import Layout from './components/layout'
import AccountStatus from './components/accountstatus';
import Operation from './components/operations'
import Transaction from './components/transaction';
import Dashboard from './components/dashboard'

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
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout username={username} />}>
            <Route
              index
              element={
                check
                  ? <AccountStatus clientID={clientID} clientStatus={clientStatus} />
                  : <HomepageClosed clientID={clientID} clientStatus={clientStatus} />
              }
            />
            <Route path="/operation" element={<Operation clientID={clientID} clientStatus={clientStatus}/>} />
            <Route path="/transaction" element={<Transaction clientID={clientID}/>} />
            <Route path="/dashboard" element={<Dashboard clientID={clientID} clientStatus={clientStatus}/>} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

/*

separare i componenti
dashboard
operazioni
dettagli account

table per le transazioni dell'utente
date.table

libreria per l'ok
tailwind

check sull'iban giusto
*/



// sto gestendo degli account bancari:
// quando passo alla route Transaction:
//   return (
//     <>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Layout username={username} />}>
//             <Route
//               index
//               element={
//                 check
//                   ? <AccountStatus clientID={clientID} clientStatus={clientStatus} />
//                   : <HomepageClosed clientID={clientID} clientStatus={clientStatus} />
//               }
//             />
//             <Route path="/operation" element={<Operation clientID={clientID} clientStatus={clientStatus}/>} />
//             <Route path="/transaction" element={<Transaction clientID={clientID}/>} />
//             {/* <Route path="/dashboard" element={<Operation />} /> */}
//           </Route>
//         </Routes>
//       </Router>
//     </>
//   );
// }

// voglio che siano visualizzati a sinitra gli account attivi da selezionare
// mentre a destra una tabella con tutte le transizione effettuate per quell'account

// voglio a sinistra