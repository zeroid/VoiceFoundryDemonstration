import React, { useEffect, useState } from 'react';
import './CallsList.css';

interface CallObject {
    at: string,
    phoneNumber: string,
    vanityPhoneNumbers: string[]
}

function CallsList() {
    const [calls, setCalls] = useState<CallObject[]>([]);
    const loadCalls = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_HOST || ''}/api/calls`);
            if (response.status === 200) {
                const calls = await response.json();
                setCalls(calls);
            }
            else {
                console.log(`Received status code ${response.status}`);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        loadCalls();
        setInterval(loadCalls, 60000); // one minute
    }, []);
    return (
        <div className="CallsList">
            <ul>
                {calls.map(a => {
                    return <li>
                        <div className="At-text">{a.at}</div>
                        <div className="PhoneNumber-text">{a.phoneNumber}</div>
                        <ul>
                            {a.vanityPhoneNumbers.map(b => {
                                return <li>{b}</li>;
                            })}
                        </ul>
                    </li>;
                })}
            </ul>
        </div>
    );
}

export default CallsList;