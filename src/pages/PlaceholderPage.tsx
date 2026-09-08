type PlaceholderPageProps = {
  title: string;
};

export const PlaceholderPage = ({ title }: PlaceholderPageProps) => (
  <>
    <h1 className="page-title">{title}</h1>
    <section className="surface">Skeleton page da san sang de ket noi API.</section>
  </>
);
