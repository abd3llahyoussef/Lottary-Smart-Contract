import { run } from "hardhat";
export default async function verify(
  contractAddress: string | any,
  args: any[]
) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("already verified");
    } else {
      console.log(e);
    }
  }
}
