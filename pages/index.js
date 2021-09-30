import { get } from "../libs/cbpaas";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Price } from "../components/Price";
import Link from 'next/link'

export default function Home({data}) {
  return (<>
    <Header/>
    <main className="flex flex-col items-center">
      {/* <section className="flex flex-row">
        {data.banners.map(banner => (
          <article key={banner.targetCode}>
            <img src={banner.thumbnail} />
          </article>)
        )}
      </section> */}
      <section className="bg-white flex flex-row flex-wrap justify-center p-4 md:p-16 gap-4 md:gap-8 w-full md:w-2/3">
        <h2 className="w-full text-center">ITEMS</h2>
        {data.products.map(product => (
          <article className="w-36 md:w-40 cursor-pointer" key={product.id}>
            <Link href={`/item/${product.id}`}>
              <a className="image image-squircle">
                <img src={product.thumbnail + '?w=200&h=200'} alt={product.name}/>
              </a>
            </Link>
            <p className="h-16 flex items-center">{product.name}</p>
            <p className="text-right">
            <Price value={product.price} hiddenTax mark/>
            </p>
          </article>)
        )}
      </section>
      {/* <pre>{"//DEBUG\n" + JSON.stringify(data, null, '\t')}</pre> */}
    </main>
    <Footer/>
  </>)
}

export async function getServerSideProps(ctx) {
  const res = await get(ctx, '/');

  if (res.statusCode !== 200)
    throw new Error(res.statusMessage);

  const data = JSON.parse(res.body);

  return { props: { data: data } }
}