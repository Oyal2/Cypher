import React from 'react';
import { useEffect } from 'react';
import { Cookies } from 'typescript-cookie';
import toast, { Toaster } from 'react-hot-toast';

export function Settings() {
  const deleteAccount = async function (): Promise<boolean> {
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
    };

    const resp: Response = await fetch('/api/cypher/delete_account', options);

    if (resp.status === 200) {
      return true;
    } else {
      const respJson = await resp.json();
    }

    throw console.error('failed to delete');
  };

  const notify = () =>
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this account?
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1vh',
            }}
          >
            <button
              style={{
                cursor: 'pointer',
                borderRadius: '15px',
                fontSize: 'small',
                padding: '1vh 3vh',
                marginRight: '2vh',
              }}
              onClick={async () => {
                toast.dismiss(t.id);
                const final = await toast.promise(deleteAccount(), {
                  loading: 'Deleting...',
                  success: <b>Deleted account</b>,
                  error: <b>failed to delete account</b>,
                });
                if (final) {
                  window.location.href = '/cypher/signin';
                }
              }}
            >
              Yes
            </button>
            <button
              style={{
                cursor: 'pointer',
                borderRadius: '15px',
                fontSize: 'small',
                padding: '1vh 3vh',
              }}
              onClick={() => {
                toast.error('Cancelled', { duration: 500 });
                toast.dismiss(t.id);
              }}
            >
              No
            </button>
          </div>
        </span>
      ),
      {
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
        iconTheme: {
          primary: '#713200',
          secondary: '#FFFAEE',
        },
      }
    );

  useEffect(() => {
    async function check() {
      const sessionid = Cookies.get('sessionid');
      console.log(sessionid);
      if (!sessionid || sessionid === '') {
        window.location.href = '/cypher/singin';
      }
    }
    check();
  }, []);

  return (
    <div>
      <div className="top-nav">
        <h1
          style={{ margin: '0 0px', fontSize: '2.5vw', cursor: 'pointer' }}
          onClick={() => {
            window.location.href = '/cypher/home';
          }}
        >
          CYPHER
        </h1>
        <div className="menu">
          <a href="/cypher/settings">Settings</a>
          <a
            onClick={() => {
              var allCookies = document.cookie.split(';');
              for (var i = 0; i < allCookies.length; i++)
                document.cookie =
                  allCookies[i] + '=;expires=' + new Date(0).toUTCString();
            }}
            href="/cypher/signin"
          >
            Logout
          </a>
        </div>
      </div>
      <Toaster />
      <div className="background" style={{ paddingTop: '9vh' }}>
        <button
          className="button"
          style={{ position: 'absolute', marginTop: '80vh', marginLeft: '3vh' }}
          onClick={async () => {
            toast.dismiss();
            console.log(notify());
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
