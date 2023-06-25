import Header from "@/components/Header";
import Loading from "@/components/Loading";
import Login from "@/components/Login";
import {
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
} from "@thirdweb-dev/react";

import Head from "next/head";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { currency } from "../../constants";
import CountdownTimer from "@/components/CountdownTimer";
import toast from "react-hot-toast";

export default function Home() {
  const address = useAddress();
  const { contract, isLoading } = useContract(
    process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [userTickets, setUserTickets] = useState(0);
  const { data: remainingTickets } = useContractRead(
    contract,
    "RemainingTickets"
  );
  const { data: currentWinningReward } = useContractRead(
    contract,
    "CurrentWinningReward"
  );
  const { data: ticketPrice } = useContractRead(contract, "ticketPrice");
  const { data: ticketCommission } = useContractRead(
    contract,
    "ticketCommission"
  );
  const { data: expiration } = useContractRead(contract, "expiration");
  const { mutateAsync: BuyTickets } = useContractWrite(contract, "BuyTickets");
  const { data: tickets } = useContractRead(contract, "getTickets");

  useEffect(() => {
    if (!tickets) return;

    const totalTickets: string[] = tickets;

    const numOfUserTickets = totalTickets.reduce(
      (total, ticketAddress) => (ticketAddress === address ? total + 1 : total),
      0
    );

    setUserTickets(numOfUserTickets);
  }, [tickets, address]);

  const handleBuyTicket = async () => {
    if (!ticketPrice) return;

    const notification = toast.loading("Buting your tickets...");

    try {
      const data = await BuyTickets({
        value: [
          ethers.utils
            .parseEther(
              (
                Number(ethers.utils.formatEther(ticketPrice)) * quantity
              ).toString()
            )
            .toString(),
        ],
      });

      toast.success("Tickets purchased successfully!", {
        id: notification,
      });
      console.info("Contract call success", data);
    } catch (error) {
      toast.error("Whoops something went wrong!", {
        id: notification,
      });
      console.error("contract call failure", error);
    }
  };

  if (isLoading) return <Loading />;
  if (!address) return <Login />;

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Head>
        <title>Lottery-Dapp</title>
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
      </Head>

      <div className="flex-1">
        <Header />

        {/* Next Draw Box */}
        <div className="space-y-5 md:space-y-0 m-5 md:flex md:flex-row justify-center items-start md:space-x-5 ">
          <div className="stats-container ">
            <h1 className="text-white text-5xl font-semibold text-center">
              The Next Draw
            </h1>
            <div className="flex justify-between P-2 space-x-2">
              <div className="stats">
                <h2 className="text-sm">Total Pool</h2>
                <p className="text-xl">
                  {currentWinningReward &&
                    ethers.utils.formatEther(
                      currentWinningReward.toString()
                    )}{" "}
                  {currency}
                </p>
              </div>
              <div className="stats">
                <h2 className="text-sm"> Tickets Remaining</h2>
                <p className="text-xl">{remainingTickets?.toNumber()}</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="mt-5 mb-3">
              <CountdownTimer />
            </div>
          </div>
          <div className="stats-container space-y-2">
            <div className="stats-container">
              <div className="flex justify-between items-center text-white pb-2">
                <h2>Price per ticket: </h2>
                <p>
                  {ticketPrice && ethers.utils.formatEther(ticketPrice)}{" "}
                  {currency}
                </p>
              </div>

              <div className="flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4">
                <p>TICKETS</p>
                <input
                  className="flex w-full bg-transparent text-right outline-none"
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2 mt-5">
                <div className="flex items-center justify-between text-emerald-300 text-sm italic font-extrabold">
                  <p>Total cost of tickets</p>
                  <p>
                    {ticketPrice &&
                      Number(ethers.utils.formatEther(ticketPrice)) *
                        quantity}{" "}
                    {currency}
                  </p>
                </div>
                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>Service fees</p>
                  <p>
                    {ticketCommission &&
                      ethers.utils.formatEther(ticketCommission)}{" "}
                    {currency}
                  </p>
                </div>
                <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                  <p>+ Network Fees</p>
                  <p>TBC</p>
                </div>
              </div>

              <button
                disabled={
                  expiration?.toString() < Date.now().toString() ||
                  remainingTickets?.toNumber() <= 0
                }
                onClick={handleBuyTicket}
                className="mt-5 w-full bg-gradient-to-br from-orange-500 to-emerald-600 px-10 py-5 rounded-md text-white shadow-xl disabled:from-gray-600 disabled:text-gray-100 disabled:to-gray-600 disabled:cursor-not-allowed"
              >
                Buy tickets {quantity} tickets for{" "}
                {ticketPrice &&
                  Number(ethers.utils.formatEther(ticketPrice.toString())) *
                    quantity}{" "}
                {currency}
              </button>
            </div>

            {userTickets > 0 && (
              <div className="stats">
                <p className="text-lg mb-2">You have {userTickets} Tickets in this draw</p>
                <div className="flex max-w-sm flex-wrap gap-x-2 gap-y-2">
                  {Array(userTickets)
                    .fill("")
                    .map((_, index) => (
                      <p
                        className="text-emerald-300 h-20 w-12 bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic"
                        key={index}
                      >
                        {index + 1}
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The price per ticket box */}
      <div>
        <div></div>
      </div>
    </div>
  );
}
