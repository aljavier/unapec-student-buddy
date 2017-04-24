#!/bin/env python
# -*- coding: utf-8 -*-
# 
# Este es un simple crawler que obtiene todos los pensums
# de todas las carreras de UNAPEC y los guarda en un archivo 
# en formato json, el archivo tendré el nombre en OUTPUT_FILE.

from bs4 import BeautifulSoup
import urllib2
import json
import datetime 

BASE_URL = 'http://unapec.edu.do/academico/pensum/pensum.aspx?carrera='
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'
OUTPUT_FILE = 'pensums.json'

offers = [
           {
               'name': 'Ingeniería e Informática', 
               'code': 'ing',
               'careers': 
                [
                    {'code': 'ISO', 'description': 'Ingeniería de Software', 'pensum': [] },
                    {'code': 'ISC', 'description': 'Ingeniería en Sistemas de Computación', 'pensum': [] },
                    {'code': 'INE', 'description': 'Ingeniería Eléctrica', 'pensum': [] },
                    {'code': 'IEL', 'description': 'Ingeniería Electrónica', 'pensum': [] },
                    {'code': 'IND', 'description': 'Ingeniería Industrial', 'pensum': [] }
                ]    
            },
            {
                'name': 'Administración',
                'code': 'adm',
                'careers':
                [
                    {'code': 'adm', 'description': 'Administración de Empresas', 'pensum': [] }    
                ]
            },
            {
                'name': 'Mercadeo',
                'code': 'mer',
                'careers':
                [
                    {'code': 'mer', 'description': 'Licenciatura en Mercadotecnia', 'pensum': [] },
                    {'code': 'nin', 'description': 'Licenciatura en Negocios Internacionales', 'pensum': [] }
                ]
            },
            {
                'name': 'Contabilidad',
                'code': 'cont',
                'careers':
                [
                    {'code': 'con', 'description': 'Licenciatura en Contabilidad', 'pensum': [] },
                    {'code': 'taf', 'description': 'Técnico Analista Financiero', 'pensum': [] },
                    {'code': 'fin', 'description': 'Licenciatura en Finanzas', 'pensum': [] }
                ]
            },
            {
                'name': 'Turismo',
                'code': 'ath',
                'careers':
                [
                    {'code': 'ATH', 'description': 'Administración Turística y Hotelera', 'pensum': [] }
                ]
            },
            {
                'name': 'Artes y Comunicación',
                'code': 'art',
                'careers':
                [
                    {'code': 'CDG', 'description': 'Licenciatura en Comunicación Digital', 'pensum': [] },
                    {'code': 'DIN', 'description': 'Licencitura en Diseño de Interiores', 'pensum': [] },
                    {'code': 'DIG', 'description': 'Licenciatura en Diseño Gráfico', 'pensum': [] },
                    {'code': 'PUB', 'description': 'Licenciatura en Publicidad', 'pensum': [] }
                ]
            },
            {
                'name': 'Derecho',
                'code': 'der',
                'careers':
                [
                    {'code': 'DER', 'description': 'Licenciatura en Derecho', 'pensum': [] }    
                ]
            }
         ]


def get_pensum_list():
    print('Iniciando scraping para obtener los pensumes desde unapec.edu.do...')
    quantity_offers = len(offers)
    offers_count = 0
    for offer in offers: 
        careers = offer['careers']
        quantity_careers = len(careers)
        careers_count = 0
        for career in careers: 
            _pensum = get_pensum(career)
            offers[offers_count]['careers'][careers_count]['pensum'] = _pensum
            print('Procesadas {0}/{1} carreras de la escuela de {2}'.format(careers_count+1, quantity_careers, offer['name']))
            careers_count = careers_count+1
        print('Procesadas {0}/{1} escuelas'.format(offers_count+1, quantity_offers))
        offers_count = offers_count+1
    export_to_json(offers)
    print('Información guardada en archivo %s' % OUTPUT_FILE)
            
def get_pensum(career):
    url_request = BASE_URL + career['code']
    request = urllib2.Request(url_request)
    request.add_header('User-Agent', USER_AGENT)
    
    print('Pensum de {0} desde {1}'.format(career['description'], url_request))
    
    data = urllib2.urlopen(request).read()
    
    soup =  BeautifulSoup(data, 'html.parser')
    quarters=[]

    count=1
    for quarter in soup.find_all('table', class_='cuatrim'):
        subjects=[]
        for row in quarter.find_all('tr'):
            tds = row.find_all('td')
            if len(tds) > 0:
                subjects.append({ 'code': tds[0].get_text().strip(), 
                                  'name': tds[1].get_text().strip(), 
                                  'credits': int(tds[2].get_text().strip()), 
                                  'pre_requisits': tds[3].get_text().strip(),
                                  'calification': 4 # Necesito ese campo en el mapping en la app
                           })
        quarters.append({ 'description': ('Cuatrimestre %s' % str(count).zfill(2)), 'subjects': subjects })
        count = count+1
    return quarters
    
def export_to_json(pensum):
    with open(OUTPUT_FILE, 'w') as json_file:
        json_file.write(json.dumps(pensum, indent=2, ensure_ascii=True))

if __name__ == '__main__':
    startTime = datetime.datetime.now()
    get_pensum_list()
    print('Finalizado. Duración {0} segundos'.format((datetime.datetime.now() - startTime)))
    
    
    
