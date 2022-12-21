import React, { useState } from 'react';
import { ReactNode } from 'react';
import { Profile } from '../directories/Home';
import { findLogo } from '../util/images';
import { DropDown } from './Dropdown';

interface ViewProfileModalProps {
  setModal: React.Dispatch<React.SetStateAction<ReactNode>>;
  profileCards: Profile[];
  setProfileCardInfo: React.Dispatch<React.SetStateAction<Profile[]>>;
  profileInfo: { profile: Profile; index: number };
}

export function ViewProfileModal(props: ViewProfileModalProps) {
  const { setModal, profileInfo, profileCards, setProfileCardInfo } = props;
  const { profile, index } = profileInfo;
  const [showSave, setShowSave] = useState<boolean>(false);
  const [username, setUsername] = useState<string>(profile.username);
  const [password, setPassword] = useState<string>(profile.password);
  const [companyLogo, setCompanyLogo] = useState<any>(profile.logo);
  const [company, setCompanyValue] = useState<string>(profile.company);
  const [error, seterror] = useState<string>('');

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
    } else {
      const respJson = await resp.json();
      seterror(respJson.error);
    }

    return false;
  };

  const editCard = async function (index: number): Promise<boolean> {
    let cards = profileCards;

    if (username === '' || password === '' || company === '') {
      seterror('Missing Values');
      return false;
    }
    if (
      username === cards[index].username &&
      password === cards[index].password &&
      company === cards[index].company
    ) {
      return true;
    }

    const info = {
      username: username,
      password: password,
      company: company,
      index: index,
    };

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
      body: JSON.stringify(info),
    };

    const resp: Response = await fetch('/api/cypher/edit_card', options);

    if (resp.status === 200) {
      const logo = findLogo(company);

      const newCards = cards.map((card, i) => {
        if (i === index) {
          return {
            username,
            password,
            company,
            logo,
          };
        } else {
          return card;
        }
      });
      setProfileCardInfo(newCards);
      setCompanyLogo(logo);

      return true;
    }

    const respJson = await resp.json();
    seterror(respJson.error);

    return false;
  };

  const editPage = (
    <>
      <DropDown
        companyValue={company}
        setCompanyValue={setCompanyValue}
        companyPic={companyLogo}
      />
      <div style={{ marginTop: '8vh' }}>
        <div className="display_info">
          <h2 className="display_name">Username</h2>
          <input
            placeholder="Enter Username"
            type={'text'}
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
        </div>
        <div className="display_info">
          <h2 className="display_name">Password</h2>
          <input
            placeholder="Enter Password"
            type={'text'}
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
      </div>
      <div style={{ margin: '1vh 0', color: 'red' }}>
        <a>{error}</a>
      </div>
    </>
  );

  const displayPage = (
    <>
      <img src={companyLogo} alt="" />
      <h3 className="company_modal">{company}</h3>
      <div className="display_info">
        <h2 className="display_name">Username</h2>
        <h2 className="display_text">{username}</h2>
      </div>
      <div className="display_info">
        <h2 className="display_name">Password</h2>
        <h2 className="display_text">{password}</h2>
      </div>
      <div style={{ margin: '1vh 0', color: 'red' }}>
        <a>{error}</a>
      </div>
    </>
  );

  return (
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
        {showSave ? editPage : displayPage}
        <div className="button_modal_group">
          {!showSave && (
            <button
              className="profile_button"
              onClick={(e) => {
                setShowSave(true);
              }}
            >
              Edit Profile
            </button>
          )}
          {showSave && (
            <button
              className="profile_button"
              onClick={async (e) => {
                if (await editCard(index)) {
                  setShowSave(false);
                }
              }}
            >
              Save Profile
            </button>
          )}
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
}
