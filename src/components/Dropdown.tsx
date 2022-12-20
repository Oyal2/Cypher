import React, { ReactNode } from 'react';
import { DEFAULT_LOGO, LOGOS } from '../util/images';

interface DropDownProps {
  setCompanyValue: React.Dispatch<React.SetStateAction<string>>;
  companyValue: string;
}

export function DropDown(props: DropDownProps): JSX.Element {
  const { setCompanyValue, companyValue } = props;
  const [options, setOptions] = React.useState<ReactNode[]>();
  const [showOptions, setShowOptions] = React.useState<boolean>(false);
  const [profileCompany, profilePicChange] = React.useState(DEFAULT_LOGO);

  React.useEffect(() => {
    setOptions(
      LOGOS.map((logo) => {
        if (logo.company !== 'Unknown') {
          return (
            <a
              key={logo.company}
              className="dropdownSelects"
              onMouseDown={(e) => {
                setCompanyValue(logo.company);
                setShowOptions(false);
                profilePicChange(logo.asset);
              }}
            >
              <img src={logo.asset} alt="" />
              {logo.company}
            </a>
          );
        }
        return null;
      })
    );
  }, [profilePicChange, setCompanyValue]);

  const filterSettings = function (event: React.ChangeEvent<HTMLInputElement>) {
    const word = event.target.value.toLowerCase();
    setCompanyValue(event.target.value);
    setOptions(
      LOGOS.map((logo) => {
        if (logo.company === 'Unknown') {
          if (word.length > 0) {
            return (
              <a
                key={word}
                className="dropdownSelects"
                onMouseDown={() => {
                  setCompanyValue(event.target.value);
                  setShowOptions(false);
                  profilePicChange(logo.asset);
                }}
              >
                <img src={logo.asset} alt="" />
                {event.target.value}
              </a>
            );
          } else {
            return null;
          }
        } else if (
          logo.company.substring(0, word.length).toLowerCase() === word
        ) {
          return (
            <a
              key={logo.company}
              className="dropdownSelects"
              onMouseDown={(e) => {
                setCompanyValue(logo.company);
                setShowOptions(false);
                e.stopPropagation();
                profilePicChange(logo.asset);
              }}
            >
              <img src={logo.asset} alt="" />
              {logo.company}
            </a>
          );
        }
        return null;
      })
    );
  };

  return (
    <>
      <img src={profileCompany} alt="" key={'profileImage'} />
      <div style={{ display: 'flex', justifyContent: 'center' }} tabIndex={0}>
        <div
          className="company_modal"
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            borderBottom: 'solid black 1px',
          }}
        >
          <input
            id="companyText"
            type={'text'}
            placeholder={'Company...'}
            onChange={filterSettings}
            onClick={() => {
              setShowOptions(true);
            }}
            onBlur={() => {
              setShowOptions(false);
            }}
            value={companyValue}
          />
          <div>{showOptions && options}</div>
        </div>
      </div>
    </>
  );
}
