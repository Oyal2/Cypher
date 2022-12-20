import React from 'react';
import { ReactNode, useState } from 'react';
import { Profile } from '../directories/Home';
import { findLogo } from '../util/images';
import { DropDown } from './Dropdown';

interface CreateModal {
  setModal: React.Dispatch<React.SetStateAction<ReactNode>>;
  profileCards: Profile[];
  setProfileCardInfo: React.Dispatch<React.SetStateAction<Profile[]>>;
}

export function CreationProfile(props: CreateModal) {
  const { setModal, profileCards, setProfileCardInfo } = props;
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [company, setCompanyValue] = useState<string>('');
  const [error, seterror] = useState<string>('');

  function createProfile() {
    if (username === '' || password === '' || company === '') {
      seterror('Missing Values');
      return;
    }
    seterror('');

    const info = {
      username: username,
      password: password,
      company: company,
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

    fetch('/api/cypher/create_profile', options)
      .then((response) => response.json())
      .then((response) => {
        if (response.error === '') {
          setProfileCardInfo(
            profileCards.concat({
              username: username,
              password: password,
              company: company,
              logo: findLogo(company),
            })
          );
          setModal(null);
        } else {
          seterror(response.error);
        }
      })
      .catch((err) => console.error(err));
    return true;
  }

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
        <DropDown companyValue={company} setCompanyValue={setCompanyValue} />
        <div style={{ marginTop: '8vh' }}>
          <div className="display_info">
            <h2 className="display_name">Username</h2>
            <input
              placeholder="Enter Username"
              type={'text'}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="display_info">
            <h2 className="display_name">Password</h2>
            <input
              placeholder="Enter Password"
              type={'text'}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div style={{ margin: '1vh 0', color: 'red' }}>
          <a>{error}</a>
        </div>
        <div
          className="button_modal_group"
          style={{ justifyContent: 'center' }}
        >
          <button
            className="profile_button"
            style={{ marginLeft: '0' }}
            onClick={() => createProfile()}
          >
            Create Profile
          </button>
        </div>
      </div>
    </div>
  );
}
