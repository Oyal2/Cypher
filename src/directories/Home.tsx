import React from 'react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Cookies } from 'typescript-cookie';
import { CreationProfile } from '../components/CreationModal';
import '../home.css';
import { findLogo } from '../util/images';

export interface Profile {
  username: string;
  password: string;
  company: string;
  logo: string;
}

export function Home() {
  const DISPLAY_COUNT = 4;
  const [modal, setModal] = useState<ReactNode | null>(null);
  const [profileCards, setProfileCardInfo] = useState<Profile[]>([]);
  const [profileDisplay, setDisplay] = useState<ReactNode[]>([]);

  const verify = async function (): Promise<boolean> {
    const options: RequestInit = {
      method: 'GET',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        Connection: 'keep-alive',
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
        'Access-Control-Allow-Credentials': 'true',
      },
      credentials: 'include',
    };

    const resp: Response = await fetch('/api/cypher/info', options);

    if (resp.status === 200) {
      const jsonResp = await resp.json();
      if (jsonResp) {
        const profiles: Profile[] = [];
        for (const profile of jsonResp) {
          const jsonProfile = JSON.parse(profile);
          profiles.push({
            username: jsonProfile.username,
            password: jsonProfile.password,
            company: jsonProfile.company,
            logo: findLogo(jsonProfile.company),
          });
        }

        setProfileCardInfo(profiles);
      }
      return true;
    }

    return false;
  };

  const deleteCard = async function (index: number): Promise<boolean> {
    const options = {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-GPC': '1',
      },
      body: JSON.stringify({ index: index }),
    };

    const resp: Response = await fetch('/api/cypher/delete_card', options);

    if (resp.status === 200) {
      let cards = profileCards;
      cards = cards.slice(0, index).concat(cards.slice(index + 1));
      setProfileCardInfo(cards);
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [modal]);

  useEffect(() => {
    const sessionid = Cookies.get('sessionid');
    console.log(sessionid);
    if (!sessionid || sessionid === '' || !verify()) {
      window.location.href = '/';
    }
  }, []);

  const createProfileModal = function (profile: Profile, index: number) {
    setModal(
      <div>
        <div
          className="modal-container"
          onClick={() => {
            setModal(null);
          }}
        />
        <div className="modal">
          <button className="modal_close">
            <a
              onClick={() => {
                setModal(null);
              }}
            >
              X
            </a>
          </button>
          <img src={profile.logo} alt="" />
          <h3 className="company_modal">{profile.company}</h3>
          <div className="display_info">
            <h2 className="display_name">Username</h2>
            <h2 className="display_text">{profile.username}</h2>
          </div>
          <div className="display_info">
            <h2 className="display_name">Password</h2>
            <h2 className="display_text">{profile.password}</h2>
          </div>
          <div className="button_modal_group">
            <button className="profile_button">Edit Profile</button>
            <button
              className="profile_button"
              onClick={async () => {
                if (await deleteCard(index)) {
                  setModal(null);
                }
              }}
            >
              Delete Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  useMemo(() => {
    const reactNodes: ReactNode[] = [];
    for (let i = 0; i < profileCards.length; i += DISPLAY_COUNT) {
      reactNodes.push(
        <div className="profileRow">
          {profileCards.slice(i, i + DISPLAY_COUNT).map((item, index) => {
            const key = i * DISPLAY_COUNT + index;
            return (
              <div className="profileCard" key={key}>
                <img src={item.logo} alt="" />
                <h3>{item.company}</h3>
                <h4>{item.username}</h4>
                <h5
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    createProfileModal(
                      {
                        company: item.company,
                        password: item.password,
                        username: item.username,
                        logo: item.logo,
                      },
                      key
                    );
                  }}
                >
                  More Info
                </h5>
              </div>
            );
          })}
        </div>
      );
    }
    setDisplay(reactNodes);
  }, [profileCards]);

  const createProfilePageModal = function () {
    setModal(
      <CreationProfile
        setModal={setModal}
        setProfileCardInfo={setProfileCardInfo}
        profileCards={profileCards}
      />
    );
  };
  return (
    <div>
      {modal}
      <div className="top-nav">
        <h1 style={{ margin: '0 0px', fontSize: '2.5vw' }}>CYPHER</h1>
        <div className="menu">
          <a href="safetyinformation.html">Settings</a>
          <a
            onClick={() => {
              var allCookies = document.cookie.split(';');
              for (var i = 0; i < allCookies.length; i++)
                document.cookie =
                  allCookies[i] + '=;expires=' + new Date(0).toUTCString();
            }}
            href="/signin"
          >
            Logout
          </a>
        </div>
      </div>
      <div className="profileMenu">{profileDisplay}</div>
      <div className="footer">
        <button className="button" onClick={createProfilePageModal}>
          Create Profile
        </button>
      </div>
    </div>
  );
}
