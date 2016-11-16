#!/bin/env python
# -*- coding: utf-8 -*-

from bs4 import BeautifulSoup
import urllib2
import json
import datetime 

BASE_URL = 'http://unapec.edu.do/academico/pensum/pensum.aspx?carrera='
USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'
OUTPUT_FILE = 'pensums.json'

offers = [
           {
               'escuela': 'Ingeniería e Informática', 
               'carreras': 
                [
                    {'codigo': 'ISO', 'descripcion': 'Ingeniería de Software', 'pensum': [] },
                    {'codigo': 'ISC', 'descripcion': 'Ingeniería en Sistemas de Computación', 'pensum': [] },
                    {'codigo': 'INE', 'descripcion': 'Ingeniería Eléctrica', 'pensum': [] },
                    {'codigo': 'IEL', 'descripcion': 'Ingeniería Electrónica', 'pensum': [] },
                    {'codigo': 'IND', 'descripcion': 'Ingeniería Industrial', 'pensum': [] }
                ]    
            },
            {
                'escuela': 'Administración',
                'carreras':
                [
                    {'codigo': 'adm', 'descripcion': 'Administración de Empresas', 'pensum': [] }    
                ]
            },
            {
                'escuela': 'Mercadeo',
                'carreras':
                [
                    {'codigo': 'mer', 'descripcion': 'Licenciatura en Mercadotecnia', 'pensum': [] },
                    {'codigo': 'nin', 'descripcion': 'Licenciatura en Negocios Internacionales', 'pensum': [] }
                ]
            },
            {
                'escuela': 'Contabilidad',
                'carreras':
                [
                    {'codigo': 'con', 'descripcion': 'Licenciatura en Contabilidad', 'pensum': [] },
                    {'codigo': 'taf', 'descripcion': 'Técnico Analista Financiero', 'pensum': [] },
                    {'codigo': 'fin', 'descripcion': 'Licenciatura en Finanzas', 'pensum': [] }
                ]
            },
            {
                'escuela': 'Turismo',
                'carreras':
                [
                    {'codigo': 'ATH', 'descripcion': 'Administración Turística y Hotelera', 'pensum': [] }
                ]
            },
            {
                'escuela': 'Artes y Comunicación',
                'carreras':
                [
                    {'codigo': 'CDG', 'descripcion': 'Licenciatura en Comunicación Digital', 'pensum': [] },
                    {'codigo': 'DIN', 'descripcion': 'Licencitura en Diseño de Interiores', 'pensum': [] },
                    {'codigo': 'DIG', 'descripcion': 'Licenciatura en Diseño Gráfico', 'pensum': [] },
                    {'codigo': 'PUB', 'descripcion': 'Licenciatura en Publicidad', 'pensum': [] }
                ]
            },
            {
                'escuela': 'Derecho',
                'carreras':
                [
                    {'codigo': 'DER', 'descripcion': 'Licenciatura en Derecho', 'pensum': [] }    
                ]
            }
         ]


def get_pensum_list():
    print('Iniciando scraping para obtener los pensumes desde unapec.edu.do...')
    quantity_offers = len(offers)
    offers_count = 1
    for offer in offers[:1]: # DEBUG - Quitar filtro luego
        careers = offer['carreras']
        quantity_careers = len(careers)
        careers_count = 1
        for career in careers[:1]: # DEBUG - Quitar filtro luego
            _pensum = get_pensum(career)
            _career = offers[0]['carreras'][0]
            offers[0]['carreras'][0]['pensum'] = _pensum
            print('Procesadas {0}/{1} carreras de la escuela de {2}'.format(careers_count, quantity_careers, offer['escuela']))
            careers_count = careers_count+1
        print('Procesadas {0}/{1} escuelas'.format(offers_count, quantity_offers))
        offers_count = offers_count+1
    export_to_json(offers)
    print('Información guardada en archivo %s' % OUTPUT_FILE)
            
def get_pensum(career):
    url_request = BASE_URL + career['codigo']
    request = urllib2.Request(url_request)
    request.add_header('User-Agent', USER_AGENT)
    
    print('Pensum de {0} desde {1}'.format(career['descripcion'], url_request))
    
    data = urllib2.urlopen(request).read()
    
    soup =  BeautifulSoup(data, 'html.parser')
    quarters=[]
    
    count=1
    for quarter in soup.find_all('table', class_='cuatrim'):
        subjects=[]
        for row in quarter.find_all('tr'):
            tds = row.find_all('td')
            if len(tds) > 0:
                subjects.append({ 'codigo': tds[0].get_text().strip(), 
                                  'asignatura': tds[1].get_text().strip(), 
                                  'creditos': int(tds[2].get_text().strip()), 
                                  'pre_requisitos': tds[3].get_text().strip() 
                           })
        quarters.append({ 'descripcion': ('Cuatrimestre %s' % str(count).zfill(2)), 'asignaturas': subjects })
        count = count+1
    return quarters
    
def export_to_json(pensum):
    with open(OUTPUT_FILE, 'w') as json_file:
        json_file.write(json.dumps(pensum, indent=2, ensure_ascii=True))

if __name__ == '__main__':
    startTime = datetime.datetime.now()
    get_pensum_list()
    print('Finalizado. Duración {0} segundos'.format((datetime.datetime.now() - startTime)))
    
    
    
