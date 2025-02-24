async function main() {
    const MyToken = await ethers.getContractFactory("MyToken");
    console.log("Deploying MyToken...");
    const myToken = await MyToken.deploy(100);
    await myToken.waitForDeployment();
    console.log("MyToken deployed to:", await myToken.getAddress());
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
