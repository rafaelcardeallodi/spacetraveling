import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): any {
  const [readingTime, setReadingTime] = useState(0);

  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  useEffect(() => {
    const texts = post.data.content;

    const summary = texts.reduce((acc, text) => {
      acc += text.heading.length;

      text.body.forEach(body => {
        acc += body.text.split(' ').length;
      });

      return acc;
    }, 0);

    const calculateReadingTime = Math.ceil(summary / 200);

    setReadingTime(calculateReadingTime);
  }, []);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <Header />
      <div className={styles.bannerContainer}>
        <img alt="banner" src={post.data.banner.url} />
      </div>
      <main className={commonStyles.container}>
        <div className={styles.post}>
          <strong>{post.data.title}</strong>
          <div className={styles.footerPost}>
            <time>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <time>
              <FiClock /> {readingTime} min
            </time>
          </div>
          <div className={styles.content}>
            {post.data.content.map(({ heading, body }) => (
              <div key={heading}>
                <h2>{heading}</h2>

                <p
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID(
    'posts',
    String(context.params.slug),
    {}
  );

  return {
    props: {
      post: response,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
