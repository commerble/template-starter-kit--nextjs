import { useState } from "react";
import { useRouter } from "next/dist/client/router";
import cms from '../../libs/cms'
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Price } from "../../components/Price";
import { appendLines, createMemberFavorite, createMemberNotice } from "../../modules/commerble-nextjs-sdk/client/api";
import { Button } from "../../components/Button";

export async function getServerSideProps(ctx) {
  const data = await cms('/item/' + ctx.params.productId);

  return { props: { data: data } }
}

export default function Home({data}) {
  const router = useRouter();
  const item = data.products[0];
  const [mainImage, setMainImage] = useState(item.images[0]);
  const [loading, setLoading] = useState(null);

  const cartin = async () => {
    setLoading('cartin');
    try {
      await appendLines([{item: item.id, qty: 1}]);
      router.push('/cart');
    }
    finally {
      setLoading(null);
    }
  }

  const fav = async () => {
    setLoading('fav');
    try {
      const result = await createMemberFavorite(item.id);
      if (result.type === 'next') {
        switch (result.next) {
          case 'site/login':
            router.push(`/login?returnUrl${encodeURIComponent(router.asPath)}`);
            break;
          case 'member/favoritelist':
            router.push(`/mypage/favorites`);
        }
      }
      if (result.type === 'error/conflict') {
        router.push(`/mypage/favorites`);
      }
    }
    finally {
      setLoading(null);
    }
  }

  const reserve = async () => {
    setLoading('reserve');
    try {
      const result = await createMemberNotice(item.id, 1);
      if (result.type === 'next') {
        switch (result.next) {
          case 'site/login':
            router.push(`/login?returnUrl${encodeURIComponent(router.asPath)}`);
            break;
          case 'member/noticelist':
            router.push(`/mypage/notices`);
        }
      }
      if (result.type === 'error/conflict') {
        router.push(`/mypage/notices`);
      }
    }
    finally {
      setLoading(null);
    }
  }
    
  return (<>
    <Header/>
    <main className="flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row p-0 md:p-16 gap-0 md:gap-8">
        <section className="flex-1">
          <div className="image image-square">
            <img src={mainImage.url} alt={item.name}/>
          </div>
        </section>
        <section className="flex-1 bg-white rounded-xl p-8 flex flex-col gap-4">
          <h1>{item.name}</h1>
          <h2>{item.summary}</h2>
          <p><Price value={data.unitPrice}/></p>
          <p>{item.detail}</p>
          <span className="flex-grow"></span>
          <Button 
            loading={loading==='cartin'}
            disabled={loading}
            looks="primary" 
            onClick={cartin}
            >CART IN</Button>
          <Button
            loading={loading==='fav'}
            disabled={loading}
            looks="text"
            className="w-full text-sm h-4"
            onClick={fav}
            >FAV</Button>
            {item.amount===0&&
              <Button
              loading={loading==='reserve'}
              disabled={loading}
              looks="text"
              className="w-full text-sm h-4"  
              onClick={reserve}
              >Reserve for Next Arrival</Button>}
        </section>
        </div>
    </main>
    <Footer/>
  </>)
}
