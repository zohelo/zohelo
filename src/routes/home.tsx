import App from '../App';

export function meta() {
  return [
    { title: 'zohelo — public data on Poland and the world' },
    {
      name: 'description',
      content: 'Public data on Poland and the world — indicators, regions and sources, updated automatically.',
    },
  ];
}

export default function Home() {
  return <App />;
}
