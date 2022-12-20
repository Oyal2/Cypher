export const DEFAULT_LOGO = require('../assets/images/default_company.png');

export interface logoAssets {
  company: string;
  asset: any;
}

export const LOGOS: logoAssets[] = [
  { company: 'Netflix', asset: require('../assets/icons/netflix_logo.png') },
  { company: 'Facebook', asset: require('../assets/icons/facebook_logo.png') },
  { company: 'Twitter', asset: require('../assets/icons/twitter_logo.png') },
  { company: 'Unknown', asset: DEFAULT_LOGO },
];

export function findLogo(companyName: string): any {
  console.log(companyName);

  for (const logo of LOGOS) {
    if (logo.company.toLocaleLowerCase() === companyName.toLocaleLowerCase()) {
      return logo.asset;
    }
  }
  return LOGOS.at(-1)!.asset;
}
