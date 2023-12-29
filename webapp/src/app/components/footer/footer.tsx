import React from 'react';
import styles from './footer.module.css';

// Import images
import Agencia from '../../../../public/agencia.png';
import Cambra from '../../../../public/cambra.png';
import CBCat from '../../../../public/cbcat.png';
import Consell from '../../../../public/consell.png';
import Europa from '../../../../public/europa.png';
import Image from 'next/image';

export default function Footer() {
  // Array of image objects
  const images = [
    { src: Agencia, alt: 'Agencia' },
    { src: Cambra, alt: 'Cambra' },
    { src: CBCat, alt: 'CBCat' },
    { src: Consell, alt: 'Consell' },
    { src: Europa, alt: 'Europa' }
  ];

  return (
    <div className={styles.footer}>
      {images.map((image, index) => (
        <Image key={index} src={image.src} alt={image.alt} width={150} height={50}/>
      ))}
    </div>
  );
}
