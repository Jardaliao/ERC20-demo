<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/jardaliao/ERC20-demo">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">ERC20-demo</h3>

  <p align="center">
    An ERC-20 demo token
    <br />
    <a href="https://github.com/jardaliao/ERC20-demo"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://jardaliao.github.io/ERC20-demo">View Demo</a>
    &middot;
    <a href="https://github.com/jardaliao/ERC20-demo/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/jardaliao/ERC20-demo/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://jardaliao.github.io/ERC20-demo)

## Built With

* [![React][React.js]][React-url]

<!-- GETTING STARTED -->
## Getting Started

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/jardaliao/ERC20-demo.git
   ```
2. Install NPM packages
   ```sh
   nvm use 18
   npm install

   cd frontend && npm install
   ```
3. Environment variables
   ```sh
   cp .env.TEMPLATE .env
   ```
   Fill in the .env file. There are two variables:
   - ALCHEMY_API_KEY - a key from [Alchemy](https://alchemy.com)
   - MNEMONIC - usually a 12 word mnemonic phrase
  
   Keep in mind that you need to have a wallet with some Sepolia ETH.
4. Deploy Contracts
   ```sh
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia
   ```
   The script will print out the contract addresses, which looks like this:`0x354eceC96677fC9C10487F208D77dba7B86FC67A`.
5. Frontend environment variables
   ```sh
   cd frontend && cp.env.TEMPLATE .env
   ```
   Fill in the.env file. There are one variables:
   - VITE_CONTRACT_ADDRESS - the contract address
6. Start the frontend
   The frontend will be available at Start the frontend
   ```sh
   cd frontend && npm run dev
   ```
   The frontend will be available at URL_ADDRESS:5173/

## Usage
- User whose wallet is connected to the frontend can:
  - Claim tokens by clicking the "Claim Tokens" button
  - Transfer tokens to other addresses
- User who depoyed the contract can:
  - Transfer tokens to other addresses
  - Burn tokens
  - Set Claimable Amount & Interval

## Roadmap
- [x] Add a new token
- [ ] Add unit test branch/line coverage check
- [ ] Update README
  - [ ] locally deploy & develop
- [ ] Add Changelog
- [ ] Proxy Contract - cheap to upgrade contracts


See the [open issues](https://github.com/jardaliao/ERC20-demo/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/jardaliao/ERC20-demo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=jardaliao/ERC20-demo" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the Unlicense License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

Project Link: [https://github.com/jardaliao/erc20-demo](https://github.com/jardaliao/erc20-demo)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Collect Sepolia ETH from Google Cloud](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
* [Brief steps about developing contracts](https://docs.openzeppelin.com/learn/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/jardaliao/erc20-demo.svg?style=for-the-badge
[contributors-url]: https://github.com/jardaliao/erc20-demo/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/jardaliao/ERC20-demo.svg?style=for-the-badge
[forks-url]: https://github.com/jardaliao/ERC20-demo/network/members
[stars-shield]: https://img.shields.io/github/stars/jardaliao/ERC20-demo.svg?style=for-the-badge
[stars-url]: https://github.com/jardaliao/ERC20-demo/stargazers
[issues-shield]: https://img.shields.io/github/issues/jardaliao/ERC20-demo.svg?style=for-the-badge
[issues-url]: https://github.com/jardaliao/ERC20-demo/issues
[license-shield]: https://img.shields.io/github/license/jardaliao/ERC20-demo.svg?style=for-the-badge
[license-url]: https://github.com/jardaliao/ERC20-demo/blob/main/license.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/jie-liao-a16900307
[product-screenshot]: images/screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/