# **App Name**: QuantumChain Logger

## Core Features:

- User Authentication: User Authentication with hardcoded credentials and frontend-only registration. Redirect users to appropriate dashboards upon login.
- Wallet Connection: Connect to MetaMask wallet, verify the connection, and show address. Handle network switching to Megaeth Testnet.
- Contract Integration: Integrate with QuantumJobLogger contract to log jobs on Megaeth Testnet, given address `0xd1471126F18d76be253625CcA75e16a0F1C5B3e2`. Transaction link available via https://www.megaexplorer.xyz/.
- Job Submission: Submission form to allow the user to call `logJob`
- Job List Display: Display of logged jobs, showing address, job type, readable timestamp, and tx link. Allow filtering jobs by user (admin only).

## Style Guidelines:

- Primary color: HSL(210, 70%, 50%) converted to #3399FF, inspired by the trust, efficiency and professionalism conveyed by the solidity and widespread adoption of the Ethereum blockchain.
- Background color: HSL(210, 20%, 95%) converted to #F0F8FF, which gives the interface a light, clean foundation, providing excellent contrast to darker UI elements while staying within the analogous spectrum.
- Accent color: HSL(180, 70%, 40%) converted to #33CCCC. The clean look evokes themes like transparency, innovation, and the interconnected nature of blockchain systems.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text, combining a modern, tech-focused aesthetic with readability.
- A modern, intuitive layout that adapts to different screen sizes, ensuring accessibility and usability across devices. This will support mobile views.
- Subtle transitions and animations to provide feedback to the user.