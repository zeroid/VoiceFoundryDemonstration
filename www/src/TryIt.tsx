import React, { useState } from 'react';
import './TryIt.css';

function TryIt() {
    const [vanityNumbers, setVanityNumbers] = useState<string[]>([]);
    
    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const target = event.target as typeof event.target & { phoneNumber: { value: string } };
            const phoneNumber = target.phoneNumber.value;
            const response = await fetch(`${process.env.REACT_APP_API_HOST || ''}/api/phonenumbers/${encodeURIComponent(phoneNumber)}/vanitynumbers`);
            if (response.status === 200) {
                const result = await response.json();
                setVanityNumbers(result.vanityPhoneNumbers);
            }
            else {
                console.log(`Received status code ${response.status}`);
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="TryIt">
            <form onSubmit={onSubmit}>
                <input type="tel" name="phoneNumber" placeholder="Phone Number" required pattern="\+[0-9]{9,13}" title="Please enter a phone-number in the format +1234567890"/>
                <input type="submit" value="Generate"/>
            </form>
            <ul>{ vanityNumbers.map(a => <li>{a}</li>) }</ul>
        </div>
    );
}

export default TryIt;