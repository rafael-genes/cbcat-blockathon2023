import { getServerSession } from "next-auth";
import {
  earnAPI,
  getBusinessRemote,
  getUserRemote,
  spendAPI,
  getTokenBalanceBlockchain
} from "../lib/actions";
import { getUserDb } from "../lib/db";
import Action from "./components/action/action";
import LogoutButton from "./components/logout/logout.button";
import styles from "./page.module.css";
import { client } from "../lib/prisma";
import { User } from "@prisma/client";
import { BusinessTokenBalancesDTO, UserTokenBalancesDTO } from "../types";

export default async function Page() {
  const session = await getServerSession();
  const userDb = await getUserDb(session!.user!.email!);

  ////////////////////////////
  // SERVER ACTION WRAPPERS //
  ////////////////////////////
  const handleEarn = async (numberTokens: number) => {
    "use server";

    const result = await earnAPI({
      email: session!.user!.email!,
      amount: numberTokens,
    });

    return result;
  };

  const handleSpend = async (numberTokens: number) => {
    "use server";

    const result = await spendAPI({
      email: session!.user!.email!,
      amount: numberTokens,
    });

    return result;
  };

  const isAdmin = userDb?.role === "admin";

  ////////////////////////////
  // REMOTE DATA FETCHING   //
  ////////////////////////////
  let userRemote: UserTokenBalancesDTO | null = null;
  let businessRemote: BusinessTokenBalancesDTO | null = null;
  let blockchainBalance: Number | null = null;

  if (!isAdmin) {
    const result = await getUserRemote(session!.user!.email!);
    if (result.error) {
      return <div>Error fetching data</div>;
    }
    userRemote = result.data!;
    blockchainBalance = await getTokenBalanceBlockchain(userRemote?.accountAddress??'');
  } else {
    const result = await getBusinessRemote();
    if (result.error) {
      return <div>Error fetching data</div>;
    }
    businessRemote = result.data!;
    blockchainBalance = await getTokenBalanceBlockchain(businessRemote?.accountAddress??'');
  }

  ////////////////////////////
  // RENDERING LOGIC        //
  ////////////////////////////

  // ADMIN has different views
  let usersElement: JSX.Element | null = null;
  if (isAdmin) {
    const users = await client.user.findMany({
      where: {
        role: "user",
      },
    });
    usersElement = (
      <div className={styles.infoContainer}>
        <h3 className={styles.infoTitle}>Users</h3>
        <ul>
          {users.map((user: User) => {
            return (
              <li key={user.email}>
                {user.email} ⇔{" "}
                <a
                  style={{
                    textDecoration: "none",
                  }}
                  href={generateLinkAddress(user.address)}
                  target="_blank"
                >
                  {formatAddressSmall(user.address)}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const accountAddress = isAdmin
    ? businessRemote?.accountAddress
    : userRemote?.accountAddress;
  const linkAddress = generateLinkAddress(accountAddress!);

  // Just take first token balance
  const tokenBalance = isAdmin
    ? businessRemote?.tokenBalances[0]
    : userRemote?.tokenBalances[0];

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.navbar}>
          <h1 className={styles.title}>Dashboard!</h1>
          <LogoutButton />
        </div>

        {/* Horitzontal line */}
        <hr
          style={{
            height: "1px",
            border: "none",
            color: "#ccc",
            textAlign: "center",
            backgroundColor: "#ccc",
          }}
        />
        {/* ACCOUNT ADDRESS FOR USERS */}
        {!isAdmin && (
          <>
            <p className={styles.email}>
              {userDb!.email} ⇔{" "}
              <a
                style={{
                  textDecoration: "none",
                }}
                href={linkAddress}
                target="_blank"
              >
                {accountAddress}
              </a>
            </p>
            <p className={styles.emailPhone}>
              {userDb!.email} ⇔{" "}
              <a
                style={{
                  textDecoration: "none",
                }}
                href={linkAddress}
                target="_blank"
              >
                {formatAddressSmall(accountAddress!)}
              </a>
            </p>
          </>
        )}

        {/* BUSINESS INFO FOR ADMIN */}
        {isAdmin && (
          <div className={styles.infoContainer}>
            <p className={styles.infoText}> Business: {businessRemote?.businessLegalName} </p>
            <p className={styles.infoText}>Email: {businessRemote?.email}</p>
            <p className={styles.email}>
              Address ⇔{" "}
              <a
                style={{
                  textDecoration: "none",
                }}
                href={linkAddress}
                target="_blank"
              >
                {accountAddress}
              </a>
            </p>
            <p className={styles.emailPhone}>
              {userDb!.email} ⇔{" "}
              <a
                style={{
                  textDecoration: "none",
                }}
                href={linkAddress}
                target="_blank"
              >
                {formatAddressSmall(accountAddress!)}
              </a>
            </p>
          </div>
        )}

        {/* Horitzontal line */}
        <hr
          style={{
            height: "1px",
            border: "none",
            color: "#ccc",
            textAlign: "center",
            backgroundColor: "#ccc",
          }}
        />

        {/* CONTRACT ADDRESS (THE SAME FOR USERS AND ADMIN USER) */}
        <h3 className={styles.infoTitle}>Token Address</h3>
        <p className={styles.email}>
          <a
            style={{
              textDecoration: "none",
            }}
            href={generateLinkToken()}
            target="_blank"
          >
            {process.env.API_CONTRACT}
          </a>
        </p>
        <p className={styles.emailPhone}>
          <a
            style={{
              textDecoration: "none",
            }}
            href={generateLinkToken()}
            target="_blank"
          >
            {formatAddressSmall(process.env.API_CONTRACT!)}
          </a>
        </p>

        {/* Horitzontal line */}
        <hr
          style={{
            height: "1px",
            border: "none",
            color: "#ccc",
            textAlign: "center",
            backgroundColor: "#ccc",
          }}
        />

        {/* TOKEN BALANCE (WITH AND WITHOUT BLOCKCHAIN) */}
        <div className={styles.infoContainer}>
          <h3 className={styles.infoTitle}>Token balance:</h3>
          <p className={styles.infoText}>
            {tokenBalance ? `Middleware: ${tokenBalance.balance} ACT` : undefined}
          </p>
          <p className={styles.infoText}>
            {`Blockchain: ${blockchainBalance} ACT`}
          </p>
        </div>

        {/* SPEND AND EARN */}
        {!isAdmin && (
          <div className={styles.inputContainer}>
            <div className={styles.rowComponents}>
              <Action text="Earn" action="earn" callback={handleEarn} />
            </div>
            <div className={styles.rowComponents}>
              <Action text="Spend" action="spend" callback={handleSpend} />
            </div>
          </div>
        )}

        {/* ADMIN USERS LIST */}
        {isAdmin && usersElement}
      </div>
    </div>
  );
}

function generateLinkToken() {
  return `https://mumbai.polygonscan.com/token/${process.env.API_CONTRACT}`;
}
function generateLinkAddress(address: string) {
  return `https://mumbai.polygonscan.com/token/${process.env.API_CONTRACT}?a=${address}`;
}

function formatAddressSmall(address: string) {
  return `${address.substring(0, 8)}...${address.slice(-8)}`;
}
